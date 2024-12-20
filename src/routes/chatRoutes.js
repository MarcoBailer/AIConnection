import express from 'express';
import { sendMessage, startSession, sendMessageStream, UserSessions } from '../controllers/chatController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/start-session', authenticateToken , startSession);
router.post('/send-message', authenticateToken , sendMessage);
router.get('/send-message-stream', sendMessageStream);
router.get('/get-user-sessions', authenticateToken , UserSessions);

export default router;
