import { Router } from "express";
import { register, login, getProfile } from "../controllers/auth.controller.ts";
import authMiddleware from "../middleware/auth.middleware.ts";

// define routes for authentication
const router = Router();


// Registration API endpoint - POST /api/auth/register
router.post("/register", register);
// Login API endpoint - POST /api/auth/login
router.post("/login", login);
// Get current user profile - GET /api/auth/profile
router.get("/profile", authMiddleware, getProfile);

export default router;







