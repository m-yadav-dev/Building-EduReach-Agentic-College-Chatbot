import mongoose, { Schema } from "mongoose";





export interface IKnowledgeDoc extends Document {
    text: string; // The original text content of the document
    embedding: number[]; // Array of numbers representing the embedding vector
    metadata: Record<string, unknown>; // Metadata can be any key-value pairs
    createdAt: Date; // Timestamp of when the document was created
    updatedAt: Date; // Timestamp of when the document was last updated
}

const knowledgeDocSchema = new Schema<IKnowledgeDoc>(
    {   
        text: {
            type: String, // Define text as a string to store the original content of the document
            required: true // Make text field required to ensure that every knowledge document has content
        }, 
        embedding: {
            type: [Number], // Define embedding as an array of numbers, because it will store the vector representation of the document
            required: true
        }, 
        metadata: {
            type: Schema.Types.Mixed, // Define metadata as a mixed type to allow for flexible key-value pairs, since metadata can vary widely depending on the use case
            default: {} // Set default value of metadata to an empty object to ensure that it is always defined, even if no metadata is provided when creating a new knowledge document
        }, 
    }, 
    {
        timestamps: true, // Automatically add createdAt and updatedAt fields
        collection: "knowledge_docs" // Specify the collection name in MongoDB
    }
)


const KnowledgeDoc = mongoose.model<IKnowledgeDoc>("KnowledgeDoc", knowledgeDocSchema); // Create a Mongoose model named "KnowledgeDoc" using the defined schema, which will be used to interact with the knowledge_docs collection in MongoDB. The model provides methods for creating, reading, updating, and deleting documents in the collection based on the defined schema structure.

export default KnowledgeDoc;

