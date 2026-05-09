import mongoose from 'mongoose';
// import ENV_VARS from '../utils/env.ts';
import ENV_VARS from '../utils/env.ts';
import { MongoClient } from 'mongodb';

const connectDB = async (): Promise<boolean> => {
    try {
        const mongoDbURI = ENV_VARS.MONGODB_URI;
        if (!mongoDbURI) {
            throw new Error('🔴 MONGODB_URI is not defined in environment variables');
        }
        const connection = await mongoose.connect(mongoDbURI);
        console.log("✅ Successfully connected to MongoDB....");
        console.log(`🟢 Connected to MongoDB: ${connection.connection.host}`);
        console.log(`📂 MongoDB Database: ${connection.connection.name}`);
        return true;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('🔴 Error connecting to MongoDB:', error.message);
        }
        else {
            console.error('🔴 An unknown error occurred while connecting to MongoDB:', error);
        }
        return false;
    }
}


let mongoClient: MongoClient | null = null; // Declaring a variable 'mongoClient' to hold the MongoDB client instance, initialized to null
const connectToMongoDB = async () => {
    if (!mongoClient) {
        mongoClient = new MongoClient(ENV_VARS.MONGODB_URI || ""); // Creating a new MongoDB client instance with the connection string from the environment variable 'MONGODB_URI'
        await mongoClient.connect();
    }
    return mongoClient; // Returning the connected MongoDB client instance
}





export { connectDB, connectToMongoDB }; // Exporting the 'connectDB' and 'connectToMongoDB' functions for use in other parts of the application