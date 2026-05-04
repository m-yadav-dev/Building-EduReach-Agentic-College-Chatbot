import express from 'express';
import type { Application, Request, Response } from 'express';
import cors from 'cors';
import router from './routes/auth.routes.ts';



const app: Application = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", router);

export default app;