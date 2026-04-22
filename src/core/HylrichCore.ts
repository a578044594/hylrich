import { Tool } from './types/Tool';
import { OpenAIService } from '../services/OpenAIService';

export interface HylrichInput {
  message: string;
  context?: any;
}

export interface HylrichOutput {
  reply: string;
  tools?: any[];
  timestamp: string;
  error?: string;
}

export class HylrichCore {
  private tools: Map<string, Tool> = new Map();
  private openai: OpenAIService | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAIService();
    }
  }

  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  async processMessage(input: string, context?: any): Promise<HylrichOutput> {
    if (this.openai) {
      try {
        const reply = await this.openai.chat(input, '你是一个有用的AI助手。');
        return { reply, timestamp: new Date().toISOString() };
      } catch (error: any) {
        return {
          reply: `抱歉，AI服务出错: ${error.message}`,
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    }

    return {
      reply: `收到消息: "${input}" (未配置 OPENAI_API_KEY)`,
      timestamp: new Date().toISOString()
    };
  }
}
