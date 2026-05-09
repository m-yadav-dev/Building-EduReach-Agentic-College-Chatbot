import type { NextFunction, Request, Response } from "express";
import { getRAGResponse } from "../services/rag/rag.service.ts";







export const sendMessage = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const { message } = request.body;

        if (!message || typeof message !== "string" || !message.trim()) {
            response.status(400).json({ error: "Message is required and must be a non-empty string." });
            return;
        }
        const answer = await getRAGResponse(message);

        response.json({ success: true, message: answer });
    }
    catch (error) {
        next(error);
    }
}


