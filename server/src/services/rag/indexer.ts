import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { connectToMongoDB } from "../../config/db.config.ts";
import { getEmbeddingsModel } from "./embeddings.ts";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import path from "node:path";
import { fileURLToPath} from "node:url";



const __filename = fileURLToPath(import.meta.url); // Getting the file path of the current file
const __dirname = path.dirname(__filename); // Getting the directory name of the current file

const knowledgeBasePath = path.join(__dirname, "../../../knowledge-base/edureach-knowledge.txt"); // Constructing the file path to the knowledge base text file by joining the current directory with the relative path to the file

export const initializeKnowledgeBase = async (): Promise<void> => {
    const client = await connectToMongoDB();
    const collection = client.db("edureach_db").collection("knowledge_docs");

    // Check if docs exist WITH valid (non-empty) embeddings
    const docWithEmbedding = await collection.findOne({
        embedding: { $exists: true, $not: { $size: 0 } },
    });

    if (docWithEmbedding) {
        const count = await collection.countDocuments();
        console.log(` Knowledge base ready (${count} chunks with embeddings)`);
        return;
    }

    // If docs exist but embeddings are empty → delete and re-index
    const existingCount = await collection.countDocuments();
    if (existingCount > 0) {
        console.log(` Found ${existingCount} chunks with EMPTY embeddings — deleting & re-indexing...`);
        await collection.deleteMany({});
    }

    console.log(" Indexing knowledge base...");

    // Verify API key FIRST with a test embedding
    const embeddings = getEmbeddingsModel();
    try {
        const testResult = await embeddings.embedQuery("test");
        console.log(` API key OK — embedding dimensions: ${testResult.length}`);
    } catch (error: any) {
        console.error(" Embedding test failed!");
        console.error("   Error:", error.message || error);
        console.error("   Get key from: https://aistudio.google.com/apikey");
        throw error;
    }

    // LOAD
    const loader = new TextLoader(knowledgeBasePath);
    const docs = await loader.load();
    if (docs.length === 0) {
        throw new Error("No documents found in knowledge base file");
    }
    const totalCharacters = docs.reduce((sum, doc) => sum + doc.pageContent.length, 0);
    console.log(`    Loaded ${totalCharacters} characters`);

    // SPLIT
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    const allSplits = await splitter.splitDocuments(docs);
    console.log(`    Split into ${allSplits.length} chunks`);

    // EMBED + STORE
    const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
        collection: collection as any,
        indexName: "edureach_vector_index",
        textKey: "text",
        embeddingKey: "embedding",
    });

    await vectorStore.addDocuments(allSplits);

    // VERIFY
    const verifyDoc = await collection.findOne({
        embedding: { $exists: true, $not: { $size: 0 } },
    });

    if (verifyDoc && Array.isArray(verifyDoc.embedding) && verifyDoc.embedding.length > 0) {
        console.log(`    ${allSplits.length} chunks stored (${verifyDoc.embedding.length}D embeddings)`);
        console.log(`     IMPORTANT: Create Atlas Vector Search index with numDimensions: ${verifyDoc.embedding.length}`);
    } else {
        await collection.deleteMany({});
        throw new Error(" Embeddings are empty! Google API returned no vectors.");
    }
};

