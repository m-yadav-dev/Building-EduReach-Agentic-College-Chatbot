import express from 'express';
import type { Application, Request, Response } from 'express';
import cors from 'cors';
import router from './routes/auth.routes.ts';
import errorHandler from './middleware/error-handler.middleware.ts';
import ENV_VARS from './utils/env.ts';
import chatRoutes from './routes/chat.routes.ts';


const app: Application = express();

app.use(cors({
    origin: ENV_VARS.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', router); // Registering the authentication routes with the Express application, so that any requests to endpoints starting with '/api/auth' will be handled by the routes defined in 'router' (which is imported from './routes/auth.routes.ts')
app.use('/api/chat', chatRoutes); // Registering the chat routes with the Express application, so that any requests to endpoints starting with '/api/chat' will be handled by the routes defined in 'chatRoutes'

app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'The requested resource was not found on this server.'
    })
})

app.use(errorHandler);

export default app;