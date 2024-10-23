import genAIService from '../services/genAIService.js';
import { getSession, addMessageToSession, createSession } from '../services/sessionService.js';

export const startSession = async (req, res) => {
  try {
    const sessionId = await createSession();
    res.json({ sessionId });
  } catch (error) {
    console.error('Erro ao iniciar sessão:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const sendMessage = async (req, res) => {
  const { sessionId, message } = req.body;

  if (!sessionId || !message) {
    return res.status(400).json({ error: 'sessionId e message são obrigatórios.' });
  }

  try {
    await addMessageToSession(sessionId, { author: 'user', content: message });

    const session = await getSession(sessionId);
    const history = session.messages;

    const responseContent = await genAIService.sendMessage(message, history);

    await addMessageToSession(sessionId, { author: 'ai', content: responseContent });

    res.json({ response: responseContent });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const sendMessageStream = async (req, res) => {
  const { sessionId, message } = req.query;

  if (!sessionId || !message) {
    return res.status(400).json({ error: 'sessionId e message são obrigatórios.' });
  }

  try {
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.flushHeaders();

    await addMessageToSession(sessionId, { author: 'user', content: message });

    const session = await getSession(sessionId);
    const history = session.messages;

    const result = await genAIService.sendMessageStream(message, history);

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

