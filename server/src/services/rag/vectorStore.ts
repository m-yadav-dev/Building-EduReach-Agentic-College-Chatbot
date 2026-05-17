import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { connectToMongoDB } from "../../config/db.config.ts";
import { getEmbeddingsModel } from "./embeddings.ts";




// -- -- Vector Store Setup ---


export const getVectorStore = async () => {
  const client = await connectToMongoDB(); // Connecting to the MongoDB database using the 'connectToMongoDB' function
  const collection = client.db("edureach_db").collection("knowledge_docs"); // Accessing the 'knowledge_docs' collection in the 'edureach_db' database to store the knowledge documents and their embeddings


  return new MongoDBAtlasVectorSearch(getEmbeddingsModel(), {
    collection: collection as any, // Providing the MongoDB collection to be used for storing and searching vector embeddings
    indexName: "edureach_search_index", // Specifying the name of the vector index to be used in MongoDB Atlas for efficient similarity search on the embeddings
    textKey: "text", // Specifying the key in the MongoDB documents that contains the original text content, which will be used for retrieval and display purposes when relevant documents are found based on vector similarity
    embeddingKey: "embedding" // Specifying the key in the MongoDB documents that contains the vector embeddings, which will be used for performing similarity search to find relevant documents based on the input query's embedding
  })

}

