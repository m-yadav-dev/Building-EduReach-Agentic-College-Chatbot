import express from 'express';
import type { Application, Request, Response } from 'express';
import cors from 'cors';
import router from './routes/auth.routes.ts';
import errorHandler from './middleware/error-handler.middleware.ts';
import ENV_VARS from './utils/env.ts';
import chatRoutes from './routes/chat.routes.ts';
import callRouter from './routes/vapi.routes.ts';


const app: Application = express();
app.set('trust proxy', true); // Enable trust proxy to get the correct client IP address when behind a proxy (like in production environments)

const allowedOrigins = [ENV_VARS.CLIENT_URL || 'http://localhost:5173', 'https://edurati.vercel.app'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('CORS policy violation: Origin not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', router); // Registering the authentication routes with the Express application, so that any requests to endpoints starting with '/api/auth' will be handled by the routes defined in 'router' (which is imported from './routes/auth.routes.ts')
app.use('/api/chat', chatRoutes); // Registering the chat routes with the Express application, so that any requests to endpoints starting with '/api/chat' will be handled by the routes defined in 'chatRoutes'
app.use('/api/vapi', callRouter); // Registering the VAPI routes with the Express application, so that any requests to endpoints starting with '/api/vapi' will be handled by the routes defined in 'callRouter'
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'The requested resource was not found on this server.'
    })
})

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'EduReach API is healthy and running smoothly.',
        timeStamp: new Date().toISOString()
    })
});

app.use(errorHandler);

export default app;