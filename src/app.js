import express from 'express';
import dotenv from 'dotenv';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config({ path: '.env.local' });

const app = express();

app.use(express.json());

// Rotas
app.use('/api/chat', chatRoutes);

export default app;
