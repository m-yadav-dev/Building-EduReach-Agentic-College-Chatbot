import type { Request, Response, NextFunction } from "express";
import User from "../models/user.model.ts";
import { hashPassword, comparePassword } from "../utils/password.util.ts";
import { generationToken } from "../utils/jwt.util.ts";


// Register API endpoint - POST /api/auth/register
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password, name, phone } = req.body;

        if (!email || !password || !name) {
            res.status(400).json({ success: false, message: "Name, email, and password are required" });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
            return;
        }

        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!isValidEmail) {
            res.status(400).json({ success: false, message: "Please provide a valid email address" });
            return;
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            res.status(400).json({ success: false, message: "User with this email already exists" });
            return;
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone: phone || null
        });

        await newUser.save();

        const token = generationToken({ id: newUser._id, email: newUser.email });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                token,
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    phone: newUser.phone
                }
            }
        })

    }
    catch (error) {
        next(error);
    }
}


// Login API endpoint - POST /api/auth/login
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: "Email and password are required" });
            return;
        }
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            res.status(400).json({ success: false, message: "Invalid email or password" });
            return;
        }

        const isPasswordMatched = await comparePassword(password, user.password);

        if (!isPasswordMatched) {
            res.status(400).json({ success: false, message: "Invalid email or password" });
            return;
        }

        const token = generationToken({ id: user._id, email: user.email });


        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                }
            }
        })
    }
    catch (error) {
        next(error);
    }
}


// Get current user profile - GET /api/auth/profile

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const currentUser = req.user;
        if (!currentUser) {
            res.status(401).json({ success: false, message: "Unauthorized user" });
            return;
        }

        const user = await User.findById(currentUser.userId).select("-password");

        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        res.status(200).json({
            success: true,
            message: "User profile retrieved successfully",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    created_at: user.created_at,
                }
            }
        })

    }
    catch (error) {
        next(error);
    }
}



