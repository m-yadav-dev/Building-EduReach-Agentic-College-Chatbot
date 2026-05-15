

import { createAgent, tool } from "langchain"; // Importing 'createAgent' and 'tool' from the 'langchain' package to create an agent and define tools for the agent to use
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"; // Importing 'ChatGoogleGenerativeAI' and 'GoogleGenerativeAIEmbeddings' from the '@langchain/google-genai' package to use Google's Generative AI for chat and embeddings

import { MongoDBAtlasVectorSearch } from "@langchain/mongodb"; // Importing 'MongoDBAtlasVectorSearch' from the '@langchain/mongodb' package to perform vector search on MongoDB Atlas

import { z } from "zod"; // Importing 'z' from the 'zod' package to define and validate schemas for input data
import { getVectorStore } from "./vectorStore.ts";


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
    console.log(`Retrieval Data:`, retrieve);
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash-lite",
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
    console.log(`RAG Agent Result:`, result);
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


