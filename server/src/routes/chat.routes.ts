import { Router } from "express";
import { sendMessage } from "../controllers/chat.controller.ts";


const chatRoutes = Router(); // Creating a new router instance using the Router function from the Express library, which will be used to define routes related to chat functionality in the application
chatRoutes.post("/message", sendMessage); // Defining a POST route at the path '/message' that will invoke the 'sendMessage' controller function when a request is made to this endpoint


export default chatRoutes; // Exporting the router instance as the default export of this module, so it can be imported and used in other parts of the application (e.g., in the main server file to register the chat routes)
