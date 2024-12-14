import express from 'express';
import { sendMessage, startSession, sendMessageStream, UserSessions, userMessageSession } from '../controllers/chatController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/start-session', authenticateToken , startSession);
router.post('/send-message', authenticateToken , sendMessage);
router.get('/send-message-stream', sendMessageStream);
router.get('/get-user-sessions', authenticateToken , UserSessions);
router.post('/get-user-message-session', authenticateToken , userMessageSession);

export default router;
