import type { Request,Response, NextFunction } from "express";
import { error } from "node:console";



const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    console.log(`errorHandler middleware invoked for ${req.method} ${req.originalUrl}`);
    error(`Error details: ${err.stack}`);
    res.status(500).json({
        success: false,
        message: err.message || "An unexpected error occurred. Please try again later."
    })
}

export default errorHandler;