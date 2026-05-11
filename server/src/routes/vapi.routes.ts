import { Router } from "express";
import { initiateVapiCall } from "../controllers/vapi.controller.ts";


import authMiddleware from "../middleware/auth.middleware.ts";



const callRouter = Router();


callRouter.post("/call", authMiddleware, initiateVapiCall);

export default callRouter;