import { Router } from "express";
import { startCall } from "../controllers/vapi.controller.ts";
import authMiddleware from "../middleware/auth.middleware.ts";



const callRouter = Router();


callRouter.post("/call", authMiddleware, startCall);

export default callRouter;