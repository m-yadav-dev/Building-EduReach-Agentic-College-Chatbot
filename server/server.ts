
import app from "./src/app.ts";
import { connectDB } from "./src/config/db.config.ts";
import { initializeKnowledgeBase } from "./src/services/rag/indexer.ts";
import ENV_VARS from "./src/utils/env.ts";
const PORT = ENV_VARS.PORT || 5000;

const startServer = async (): Promise<void> => {
    try {
        const isDbConnected = await connectDB();
        await initializeKnowledgeBase(); // Initializing the knowledge base by calling the 'initializeKnowledgeBase' function, which will index the knowledge documents and their embeddings in the MongoDB database, so that they can be efficiently searched when handling user queries in the chat functionality of the application
        app.listen(PORT, () => {
            console.log(`🚀 EduReach Server is running on port ${PORT}...`);
            console.log(`🌐 API Endpoint: http://localhost:${PORT}/api/auth`);
            console.log(`🌐 Chat Endpoint: http://localhost:${PORT}/api/chat`);
            console.log(`🌐 NODE ENVIRONMENT: ${ENV_VARS.NODE_ENV}`);
            if (isDbConnected) {
                console.log(`📂 Server is connected to MongoDB and ready to handle requests.`);
            }
            else {
                console.log(`📂 Server is running without an active MongoDB connection.`);
            }
            console.log(`🔐 Authentication routes are available at: http://localhost:${PORT}/api/auth`);
            console.log(`Node.js version: ${process.version}`);
            console.log('✅ Server started successfully!');
            console.log(`Press Ctrl+C to stop the server.`);
        })
    }

    catch (error) {
        console.error('❌ Error starting the server:', error);

        if (!ENV_VARS.MONGODB_URI || !ENV_VARS.VAPI_API_KEY) {
            console.error('⚠️  Missing required environment variables. Please ensure that MONGODB_URI and VAPI_API_KEY are set in your .env file.');
            process.exit(1);
        }

        process.exit(1);

    }
}

startServer();