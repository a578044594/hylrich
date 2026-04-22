import { BaseAgent } from './BaseAgent';
import { Message } from '../types/agent';
export declare class OpenAIAgent extends BaseAgent {
    processMessage(message: string, sessionId: string): Promise<Message>;
}
