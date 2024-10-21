const sessions = {};

export const createSession = () => {
  const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  sessions[sessionId] = { history: [] };
  return sessionId;
};

export const getSession = (sessionId) => {
  return sessions[sessionId];
};

export const addMessageToSession = (sessionId, message) => {
  if (sessions[sessionId]) {
    sessions[sessionId].history.push(message);
  }
};
