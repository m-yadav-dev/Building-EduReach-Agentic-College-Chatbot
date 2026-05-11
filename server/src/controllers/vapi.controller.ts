import type { Request, Response, NextFunction } from "express";
import User from "../models/user.model.ts";
import { initialOutboundCallPayload } from "../services/vapi/vapi.service.ts";


// post /api/vapi/call


export const initiateVapiCall = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phone: rawPhone, course, topic } = req.body;
        console.log(`Received VAPI call request with phone: ${rawPhone}, course: ${course}, topic: ${topic}`);
        // Accept phone as string or number from client — normalize to a string
        if (rawPhone === undefined || rawPhone === null) {
            res.status(400).json({ message: "Invalid phone number" });
            return;
        }

        const phoneStr = typeof rawPhone === "number" ? String(rawPhone) : String(rawPhone);
        // remove spaces and common separators
        const cleaned = phoneStr.replace(/[\s\-()]/g, "").trim();

        // allow optional leading + then digits
        const digitsOnly = cleaned.replace(/[^+0-9]/g, "");

        // basic length check (10-15 digits excluding a leading +)
        const digitCount = digitsOnly.startsWith("+") ? digitsOnly.slice(1).replace(/\D/g, "").length : digitsOnly.replace(/\D/g, "").length;
        if (digitCount < 10 || digitCount > 15) {
            res.status(400).json({ message: "Invalid phone number" });
            return;
        }

        const phone = cleaned;



        const currentUser = (req as any).user;
        if (!currentUser) {
            res.status(401).json({ message: "Unauthorized: missing user token" });
            return;
        }

        // Support tokens that may use `userId` or `id` (or `sub`) in the payload
        const userId = currentUser.userId ?? currentUser.id ?? currentUser.sub;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: invalid token payload" });
            return;
        }

        const user = await User.findById(userId).select("name email");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        console.log(`Initiating VAPI call for user ${user.name} (${user.email}) with phone: ${phone}, course: ${course}, topic: ${topic}`);

        const result = await initialOutboundCallPayload({
            phone: phone,
            course: course,
            topic: topic,
            userName: user.name,
            userEmail: user.email
        })



        res.status(200).json({
            success: true,
            message: "Call initiated successfully",
            data: {
                callId: result.id,
                status: result.status,
            }
        })
    }
    catch (error) {
        next(error);
    }
}