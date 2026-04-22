import OpenAI from 'openai';

export class OpenAIService {
  private client: OpenAI;
  private model: string;

  constructor(apiKey?: string, model?: string, baseUrl?: string) {
    const config: any = {
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    };
    if (baseUrl || process.env.OPENAI_BASE_URL) {
      config.baseURL = baseUrl || process.env.OPENAI_BASE_URL;
    }
    this.client = new OpenAI(config);
    this.model = model || process.env.LLM_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  async chat(message: string, systemPrompt?: string): Promise<string> {
    try {
      const messages: OpenAI.ChatCompletionMessageParam[] = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt } as OpenAI.ChatCompletionSystemMessageParam);
      }
      messages.push({ role: 'user', content: message } as OpenAI.ChatCompletionUserMessageParam);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      });

      return response.choices[0]?.message?.content || 'No response';
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI error: ${error.message}`);
    }
  }
}
