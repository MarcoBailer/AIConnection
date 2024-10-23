import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { GoogleGenerativeAI } from '@google/generative-ai';

class GenAIService {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async sendMessage(message, history = []) {
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
  
    try {
      const messageObject = {
        content: {
          parts: [message],
        },
      };
  
      const result = await chat.sendMessageStream(message);
  
      const response = await result.response;
      const text = await response.text();
  
      return text;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  async sendMessageStream(message, history = []) {
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
