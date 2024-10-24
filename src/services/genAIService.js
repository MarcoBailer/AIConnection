import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { GoogleGenerativeAI } from '@google/generative-ai';

class GenAIService {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async sendMessage(message, history = []) {
       
  const previusMessages = history.slice(0, -1);

  const previusConvesation = previusMessages.map(msg => `${msg.author}: ${msg.content}`).join('\n');

  const reversedMessages = [...previusMessages].reverse();

  const lastUserMessage = reversedMessages.find(msg => msg.author === 'user')?.content || '';
  
  const prompt =  `Conversa anterior:
      ${previusConvesation}

      Sua última pergunta: ${lastUserMessage}

      Responda à pergunta: ${message}
    `

  console.log('previus conversation:', previusConvesation);
  
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
