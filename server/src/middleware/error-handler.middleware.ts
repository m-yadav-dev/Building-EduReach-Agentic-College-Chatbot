import type { Request,Response, NextFunction } from "express";



const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    console.log(`errorHandler middleware invoked for ${req.method} ${req.originalUrl}`);
    res.status(500).json({
        success: false,
        message: err.message || "An unexpected error occurred. Please try again later."
    })
}

export default errorHandler;