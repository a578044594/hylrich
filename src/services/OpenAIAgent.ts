import { BaseAgent } from './BaseAgent';
import { ToolRegistry } from '../services/ToolRegistry';
import { EventBus } from '../core/EventBus';
import { ContextManager } from './ContextManager';
import { AgentConfig } from '../types/agent';
import { Message } from '../types/message';
import { openai } from './OpenAIService';

export class OpenAIAgent extends BaseAgent {
  async processMessage(message: string, sessionId: string): Promise<Message> {
    this.state = 'running';
    this.emit({ type: 'agent.started', payload: { sessionId } });

    // Retrieve conversation history
    const history = this.context.getMessages(sessionId);
    
    // Build messages
    const messages = [
      ...(this.systemPrompt ? [{ role: 'system', content: this.systemPrompt } as any] : []),
      ...history.map(m => ({ role: m.role as any, content: m.content })),
      { role: 'user', content: message }
    ];

    try {
      // Simple chat completion without tool calling for now
      const response = await openai.chat(messages, this.model);

      const content = response.choices?.[0]?.message?.content || '';
      
      // Save to context
      const userMsg: Message = {
        id: `msg-${Date.now()}-user`,
        agentId: this.id,
        role: 'user',
        content: message,
        timestamp: Date.now()
      };
      const assistantMsg: Message = {
        id: `msg-${Date.now()}-assistant`,
        agentId: this.id,
        role: 'assistant',
        content,
        timestamp: Date.now()
      };
      this.context.addMessage(sessionId, userMsg);
      this.context.addMessage(sessionId, assistantMsg);

      this.state = 'idle';
      this.emit({ type: 'agent.completed', payload: { sessionId, messageId: assistantMsg.id } });
      return assistantMsg;
    } catch (err: any) {
      this.state = 'error';
      this.emit({ type: 'agent.error', payload: { sessionId, error: err.message } });
      throw err;
    }
  }
}
