import genAIService from '../services/genAIService.js';
import { getSession, addMessageToSession, createSession } from '../services/sessionService.js';
import SSE from 'sse-express';

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
    // Adicionar a mensagem do usuário à sessão
    await addMessageToSession(sessionId, { author: 'user', content: message });

    // Obter a sessão atualizada com o histórico de mensagens
    const session = await getSession(sessionId);
    const history = session.messages;

    // Enviar a mensagem para o serviço de IA
    const responseContent = await genAIService.sendMessage(message, history);

    // Adicionar a resposta da IA à sessão
    await addMessageToSession(sessionId, { author: 'ai', content: responseContent });

    res.json({ response: responseContent });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

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
