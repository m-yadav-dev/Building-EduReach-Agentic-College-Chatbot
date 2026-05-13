

import type { Request, Response, NextFunction } from "express";
import User from "../models/user.model.ts";
// import { initiateOutboundCall } from "../services/vapi.service.ts";
import { initiateOutboundCall } from "../services/vapi/vapi.service.ts";
import { log } from "console";

// POST /api/vapi/call
export const startCall = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { phoneNumber, preferredCourse } = req.body;

        console.log(`1. Request received to start call with phoneNumber: ${phoneNumber} and preferredCourse: ${preferredCourse}`);
        console.log('2. User from Token:', (req as any).user);
        
        if (!phoneNumber || phoneNumber.trim().length < 10) {
            res.status(400).json({ success: false, message: "Valid phone number is required." });
            return;
        }
        
        // const currentUser = (req as any).user;
        const user = await User.findOne({ phone: phoneNumber.trim() }).select("name email");
        console.log('3. Database Search Results:', user);        

        if (!user) {
            res.status(404).json({ success: false, message: "User not found." });
            return;
        }

        const result = await initiateOutboundCall({
            phoneNumber: phoneNumber.trim(),
            userName: user.name,
            preferredCourse,
            userEmail: ""
        });

        res.status(200).json({
            success: true,
            message: "Call initiated. You will receive a call shortly.",
            data: { callId: result.id, status: result.status },
        });
    } catch (error) {
        next(error);
    }
};

