import express from 'express';
import { sendMessage, startSession } from '../controllers/chatController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/start-session', authenticateToken , startSession);
router.post('/send-message', authenticateToken , sendMessage);
// router.post('/send-message-stream', authenticateToken, sendMessageStream);

export default router;
