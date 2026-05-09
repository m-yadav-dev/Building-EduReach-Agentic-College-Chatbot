
import path from "node:path"; // Importing the 'path' module from Node.js to handle file paths
import { fileURLToPath } from "node:url"; // Importing the 'fileURLToPath' function from Node.js to convert a file URL to a file path
import { MongoClient } from "mongodb"; // Importing the 'MongoClient' class from the 'mongodb' package to connect to a MongoDB database

import { createAgent, tool } from "langchain"; // Importing 'createAgent' and 'tool' from the 'langchain' package to create an agent and define tools for the agent to use
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"; // Importing 'ChatGoogleGenerativeAI' and 'GoogleGenerativeAIEmbeddings' from the '@langchain/google-genai' package to use Google's Generative AI for chat and embeddings

import { MongoDBAtlasVectorSearch } from "@langchain/mongodb"; // Importing 'MongoDBAtlasVectorSearch' from the '@langchain/mongodb' package to perform vector search on MongoDB Atlas
import { TextLoader } from "@langchain/classic/document_loaders/fs/text"; // Importing 'TextLoader' from the '@langchain/classic/document_loaders/fs/text' package to load text documents from the file system

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"; // Importing 'RecursiveCharacterTextSplitter' from the '@langchain/textsplitters' package to split text into smaller chunks based on character count
import { z } from "zod"; // Importing 'z' from the 'zod' package to define and validate schemas for input data
import ENV_VARS from "../utils/env.ts";



// --- MongoDB Native Client (for LangChain vector operations) ---
// ---- __dirname for ESM ----

const __filename = fileURLToPath(import.meta.url); // Getting the file path of the current file
const __dirname = path.dirname(__filename); // Getting the directory name of the current file


// ---- MongoDB native Connection Setup ----

let mongoClient: MongoClient | null = null; // Declaring a variable 'mongoClient' to hold the MongoDB client instance, initialized to null
export const connectToMongoDB = async () => {
    if (!mongoClient) {
        mongoClient = new MongoClient(ENV_VARS.MONGODB_URI || ""); // Creating a new MongoDB client instance with the connection string from the environment variable 'MONGODB_URI'
        await mongoClient.connect();
    }
    return mongoClient; // Returning the connected MongoDB client instance
}



// -- Google GenAi embeddings setup --
// Initializing the Google Generative AI embeddings model with the API key from environment variables
// Converts any text into a 3072-dimensional vector (array of 3072 numbers). Similar texts produce vectors that are "close" in vector space — this is how we find relevant chunks.

export const getEmbeddingsModel = () => {
    if (!ENV_VARS.GOOGLE_API_KEY) { // Checking if the 'GOOGLE_API_KEY' is not defined in the environment variables, and if so, throwing an error to indicate that the API key is required for using Google's Generative AI embeddings
        throw new Error("GOOGLE_API_KEY is not defined in the environment variables");
    }
    return new GoogleGenerativeAIEmbeddings({
        apiKey: ENV_VARS.GOOGLE_API_KEY, // Providing the API key for authentication with Google's Generative AI service to generate embeddings
    model: "text-embedding-004" // Use a supported Gemini embedding model for embedContent requests
    })
}



// --- Vector Store Setup ---
// Function to create and return a MongoDB Atlas Vector Search instance, which will be used to store and search vector embeddings in MongoDB


export const getVectorStore = async () => {
    const client = await connectToMongoDB(); // Connecting to the MongoDB database using the 'connectToMongoDB' function
    const collection = client.db("edureach_db").collection("knowledge_docs"); // Accessing the 'knowledge_docs' collection in the 'edureach_db' database to store the knowledge documents and their embeddings


    return new MongoDBAtlasVectorSearch(getEmbeddingsModel(), {
    collection: collection as any, // Providing the MongoDB collection to be used for storing and searching vector embeddings
        indexName: "embedding_index", // Specifying the name of the vector index to be used in MongoDB Atlas for efficient similarity search on the embeddings
        textKey: "text", // Specifying the key in the MongoDB documents that contains the original text content, which will be used for retrieval and display purposes when relevant documents are found based on vector similarity
        embeddingKey: "embedding" // Specifying the key in the MongoDB documents that contains the vector embeddings, which will be used for performing similarity search to find relevant documents based on the input query's embedding
    })

}





// --- Initialize Knowledge Base ---
// A) INDEXING — runs ONCE at server startup
// ============================================
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
  const filePath = path.join(__dirname, "../../knowledge-base/edureach-knowledge.txt");
  const loader = new TextLoader(filePath);
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









// --- Create Retrieval Tool for Agent ---
const createRetrieveTool = (vectorStore: MongoDBAtlasVectorSearch) => {
  return tool(
    async ({ query }: { query: string }) => {
      const retrievedDocs = await vectorStore.similaritySearch(query, 3);
      return retrievedDocs
        .map((doc) => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`)
        .join("\n\n");
    },
    {
      name: "retrieve",
      description:
        "Retrieve information from the EduReach College knowledge base. " +
        "Use this for any questions about courses, fees, admissions, mentors, campus, placements.",
      schema: z.object({ query: z.string() }),
    }
  );
};






// --- Get RAG Response ---
export const getRAGResponse = async (question: string): Promise<string> => {
  try {
    const vectorStore = await getVectorStore();
    const retrieve = createRetrieveTool(vectorStore);

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      temperature: 0.7,
    });

    const agent = createAgent({
      model,
      tools: [retrieve],
      systemPrompt:
        "You are EduReach Bot, a helpful AI counselor for EduReach College, Hyderabad. " +
        "ALWAYS use the retrieve tool to search the knowledge base before answering. " +
        "Be concise, friendly, and professional. " +
        "If the information is not found, say: " +
        "'I don't have that information right now. Click Talk to Us to speak with a counselor.'",
    });

    const result = await agent.invoke({
      messages: [{ role: "user", content: question }],
    });

    const messages = result.messages;
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage) {
      return "I couldn't generate a response. Please try again.";
    }

    return typeof lastMessage.content === "string"
      ? lastMessage.content
      : JSON.stringify(lastMessage.content);
  } catch (error) {
    console.error(" RAG Agent Error:", error);
    return "I'm having trouble right now. Please try again or click 'Talk to Us'.";
  }
};