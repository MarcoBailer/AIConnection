import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { GoogleGenerativeAI } from '@google/generative-ai';


class GenAIService {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async sendMessage(message, history = []) {
    const chat = this.model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    try {
      const result = await chat.sendMessage(message);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

export default new GenAIService(process.env.API_KEY);