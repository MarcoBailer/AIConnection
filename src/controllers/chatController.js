import genAIService from '../services/genAIService.js';
import { getSession, addMessageToSession, createSession } from '../services/sessionService.js';
import SSE from 'sse-express';

export const startSession = (req, res) => {
  const sessionId = createSession();
  res.json({ sessionId });
};

export const sendMessage = async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'A mensagem é obrigatória.' });
  }

  try {
    const response = await genAIService.sendMessage(message, history);
    res.json({ response });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// export const sendMessage = async (req, res) => {
//   const { message, sessionId } = req.body;

//   if (!message || !sessionId) {
//     return res.status(400).json({ error: 'Mensagem e sessionId são obrigatórios.' });
//   }

//   const session = getSession(sessionId);

//   if (!session) {
//     return res.status(400).json({ error: 'SessionId inválido.' });
//   }

//   try {
//     // Adiciona a mensagem do usuário ao histórico
//     session.history.push({ author: 'user', content: message });

//     const response = await genAIService.sendMessage(message, session.history);

//     // Adiciona a resposta da IA ao histórico
//     session.history.push({ author: 'ai', content: response });

//     res.json({ response });
//   } catch (error) {
//     console.error('Erro ao enviar mensagem:', error);
//     res.status(500).json({ error: 'Erro interno do servidor.' });
//   }
// };

export const sendMessageStream = async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || !sessionId) {
    return res.status(400).json({ error: 'Mensagem e sessionId são obrigatórios.' });
  }

  const session = getSession(sessionId);

  if (!session) {
    return res.status(400).json({ error: 'SessionId inválido.' });
  }

  res.sseSetup();
  try {
    session.history.push({ author: 'user', content: message });

    const result = await genAIService.sendMessageStream(message, session.history);

    for await (const chunk of result.stream) {
      const chunkText = await chunk.text();
      res.sseSend(chunkText);
    }

    res.end();
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};
