import { v4 as uuidv4 } from 'uuid';
import Session from '../models/Session.js';

export const createSession = async () => {
  const sessionId = uuidv4();
  const session = new Session({ sessionId, messages: [] });
  await session.save();
  return sessionId;
};

export const getSession = async (sessionId) => {
  return await Session.findOne({ sessionId });
};

export const addMessageToSession = async (sessionId, message) => {
  const session = await getSession(sessionId);
  if (!session) {
    throw new Error('Sessão não encontrada');
  }
  session.messages.push(message);
  await session.save();
  return session;
};
