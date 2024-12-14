import { v4 as uuidv4 } from 'uuid';
import Session from '../models/Session.js';

export const createSession = async (userId, name) => {
  const session = new Session({
    sessionId: uuidv4(),
    userId: userId,
    name: name,
    messages: [],
  });
  await session.save();
  return session;
};

export const getSession = async (sessionId) => {
  return await Session.findOne({ sessionId });
};

export const getUserSessions = async (userId) => {
  return await Session.find({ userId });
};

export const getMessageSession = async (sessionId) => {
  const session = await getSession(sessionId);
  if (!session) {
    throw new Error('Sessão não encontrada');
  }
  return session.messages;
}

export const addMessageToSession = async (sessionId, message) => {
  const session = await getSession(sessionId);
  if (!session) {
    throw new Error('Sessão não encontrada');
  }
  session.messages.push(message);
  await session.save();
  return session;
};
