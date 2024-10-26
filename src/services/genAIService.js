import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { GoogleGenerativeAI } from '@google/generative-ai';

const chatSessions = new Map();

class GenAIService {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  getOrCreateChatSession(sessionId, history) {
    if (chatSessions.has(sessionId)) {
      return chatSessions.get(sessionId);
    } else {
      const formattedHistory = history.map((msg) => ({
        role: msg.author,
        content: {
          parts: [msg.content],
        },
      }));

      const chat = this.model.startChat({
        messages: formattedHistory,
        generationConfig: {
          maxOutputTokens: 500,
        },
      });

      chatSessions.set(sessionId, chat);
      return chat;
    }
  }
  //historico implementado para que a IA possa responder com base em conversas anteriores, se necessário.
  //Tecnicamente, não é necessário para o funcionamento do endpoint, é uma funcionalidade interessante para o usuário.
  //Este método tem um "tempo de vida". Inicio: usuário envia uma mensagem, fim: IA responde a mensagem. 
  //é possível implementar um histórico de conversa infinito, mas isso pode ser custoso para o servidor.
  async sendMessage(sessionId, message, history = []) {
    const chat = this.getOrCreateChatSession(sessionId, history);
  
    try {
      const result = await chat.sendMessage(message);      
      if (
        result.response &&
        result.response.candidates &&
        result.response.candidates.length > 0 &&
        result.response.candidates[0].content &&
        result.response.candidates[0].content.parts
      ) {
        const parts = result.response.candidates[0].content.parts;
        if(!Array.isArray(parts)) {
          throw new Error('Formato inesperado de parts na resposta da IA.');
        }
        const text = parts.map((part) => part.text).join('');
        console.log('Texto da IA:', text);
        return text;
      } else {
        throw new Error('Resposta inválida do modelo de IA.');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }
  //se for necessário enviar uma mensagem com histórico de conversa
  //este método é útil para que a IA possa responder com base em conversas anteriores, se necessário.
  //No entanto, um tanto quanto custoso para o servidor.
  //Fácil de implementar.
  //Tecnicamente, não é necessário para o funcionamento do endpoint, é uma funcionalidade interessante para o usuário.
  async sendMessagePromptHistory(message, history = []) {
       
    const previusMessages = history.slice(0, -1);
  
    const previusConvesation = previusMessages.map(msg => `${msg.author}: ${msg.content}`).join('\n');
  
    const reversedMessages = [...previusMessages].reverse();
  
    const lastUserMessage = reversedMessages.find(msg => msg.author === 'user')?.content || '';
    
    const prompt =  `Conversa anterior:
        ${previusConvesation}
  
        Sua última pergunta: ${lastUserMessage}
  
        Responda à pergunta: ${message}
      `
      const chat = this.model.startChat({
        messages: [],
        generationConfig: {
          maxOutputTokens: 500,
        },
      });
    
      try {
        const result = await chat.sendMessageStream(prompt);      
  
        const response = await result.response;
        const text = await response.text();
    
        return text;
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        throw error;
      }
  }
  
  //Este método é útil para enviar mensagens em tempo real.
  async sendMessageStream(sessionId, message, history = []) {
    const chat = this.getOrCreateChatSession(sessionId, history);

    try {
      const result = await chat.sendMessageStream(message);
      return result;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }
  
}

export default new GenAIService(process.env.API_KEY);
