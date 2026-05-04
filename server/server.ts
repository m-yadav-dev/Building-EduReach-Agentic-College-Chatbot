import app from './src/app.ts';
import connectDB from './src/config/db.config.ts';
import ENV_VARS from './src/utils/env.ts';


const PORT = ENV_VARS.PORT || 5000;

const startServer = async (): Promise<void> => {
    try {
        const isDbConnected = await connectDB();
        app.listen(PORT, () => {
            console.log(`🚀 EduReach Server is running on port ${PORT}...`);
            console.log(`🌐 API Endpoint: http://localhost:${PORT}/api/auth`);
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
        process.exit(1);
    }
}

startServer();