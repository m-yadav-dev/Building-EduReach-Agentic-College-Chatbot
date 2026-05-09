import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import ENV_VARS from "../../utils/env.ts";



export const getEmbeddingsModel = () => {
    if (!ENV_VARS.GOOGLE_API_KEY) { // Checking if the 'GOOGLE_API_KEY' is not defined in the environment variables, and if so, throwing an error to indicate that the API key is required for using Google's Generative AI embeddings
        throw new Error("GOOGLE_API_KEY is not defined in the environment variables");
    }
    return new GoogleGenerativeAIEmbeddings({
        apiKey: ENV_VARS.GOOGLE_API_KEY, // Providing the API key for authentication with Google's Generative AI service to generate embeddings
        model: "gemini-embedding-001" // Use a supported Gemini embedding model for embedContent requests
    })
}
