import OpenAI from 'openai';

class OpenAIService {
  private client: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    const baseURL = process.env.OPENAI_BASE_URL;
    if (apiKey) {
      this.client = new OpenAI({
        apiKey,
        baseURL: baseURL || undefined
      });
    }
  }

  async chat(messages: any[], model?: string) {
    if (!this.client) throw new Error('OpenAI client not initialized (missing OPENAI_API_KEY)');
    const response = await this.client.chat.completions.create({
      model: model || process.env.LLM_MODEL || 'gpt-4o',
      // @ts-ignore: bypass OpenAI SDK strict types
      messages
    });
    return response;
  }

  async streamChat(messages: any[], model?: string) {
    if (!this.client) throw new Error('OpenAI client not initialized');
    return this.client.chat.completions.create({
      model: model || process.env.LLM_MODEL || 'gpt-4o',
      // @ts-ignore
      messages,
      stream: true
    });
  }
}

export const openai = new OpenAIService();
