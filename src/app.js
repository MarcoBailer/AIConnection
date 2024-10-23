import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import chatRoutes from './routes/chatRoutes.js';
import connectDB from './config/database.js';

dotenv.config({ path: '.env.local' });

const app = express();

connectDB();

app.use(express.json());

// Rotas
app.use('/api/chat', chatRoutes);

app.use(express.static(path.join(process.cwd())));

export default app;
