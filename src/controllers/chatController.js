import genAIService from '../services/genAIService.js';
import { getSession, addMessageToSession, createSession, getUserSessions } from '../services/sessionService.js';

export const startSession = async (req, res) => {
  const  userId  = req.user.userId;

  if (!userId) {
    return res.status(400).json({ error: 'userId é obrigatório.' });
  }

  try {
    const session = await createSession(userId);
    res.json({ sessionId: session.sessionId });
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const UserSessions = async (req, res) => {
  const  userId  = req.user.userId;

  if (!userId) {
    return res.status(400).json({ error: 'userId é obrigatório.' });
  }

  try {
    const sessions = await getUserSessions(userId);
    res.json(sessions);
  } catch (error) {
    console.error('Erro ao obter sessões do usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

export const sendMessage = async (req, res) => {
  const { sessionId, message } = req.body;
  const  userId  = req.user.userId;

  if (!sessionId || !message || !userId) {
    return res.status(400).json({ error: 'sessionId, userId e message são obrigatórios.' });
  }

  try {
    const session = await getSession(sessionId);

    if (!session || session.userId !== userId) {
      return res.status(404).json({ error: 'Sessão não encontrada ou não pertence ao usuário' });
    }

    await addMessageToSession(sessionId, { author: 'user', content: message });

    const history = session.messages;

    const responseContent = await genAIService.sendMessage(sessionId, message, history);

    await addMessageToSession(sessionId, { author: 'ai', content: responseContent });

    res.json({ response: responseContent });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const sendMessageStream = async (req, res) => {
  const { sessionId, message } = req.query;
  const  userId  = req.user.userId;

  if (!sessionId || !message || !userId) {
    return res.status(400).json({ error: 'sessionId, userId e message são obrigatórios.' });
  }

  try {
    const session = await getSession(sessionId);

    if (!session || session.userId !== userId) {
      res.write(`event: error\ndata: "Sessão não encontrada ou não pertence ao usuário."\n\n`);
      res.end();
      return;
    }
    
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.flushHeaders();

    await addMessageToSession(sessionId, { author: 'user', content: message });

    const history = session.messages;

    const result = await genAIService.sendMessageStream(sessionId, message, history);

    if (!result.stream) {
      console.error('Erro: result.stream está indefinido');
      res.write(`event: error\ndata: "Erro ao obter o stream de resposta."\n\n`);
      res.end();
      return;
    }

    let partialMessage = '';

    for await (const chunk of result.stream) {
      const chunkText = await chunk.text();
      partialMessage += chunkText;
      res.write(`data: ${JSON.stringify(chunkText)}\n\n`);
    }

    await addMessageToSession(sessionId, { author: 'ai', content: partialMessage });
    res.write(`event: end\ndata: [DONE]\n\n`);
    res.end();
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.write(`event: error\ndata: ${JSON.stringify(error.message)}\n\n`);
    res.end();
  }
};