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

    const toolDefs = this.toolRegistry.list();
    const openAITools = this.toOpenAITools(toolDefs);
    const maxToolRounds = 5;

    try {
      let content = '';
      for (let round = 0; round < maxToolRounds; round++) {
        const response = await openai.chat(messages, this.model, {
          tools: openAITools.length > 0 ? openAITools : undefined,
          tool_choice: openAITools.length > 0 ? 'auto' : undefined
        });

        const assistantMessage = response.choices?.[0]?.message;
        if (!assistantMessage) {
          break;
        }

        const toolCalls = assistantMessage.tool_calls || [];
        if (toolCalls.length === 0) {
          content = assistantMessage.content || '';
          break;
        }

        // Append assistant tool-call message into prompt context
        messages.push({
          role: 'assistant',
          content: assistantMessage.content || '',
          tool_calls: toolCalls
        } as any);

        for (const toolCall of toolCalls) {
          const tc: any = toolCall;
          const functionName = tc.function?.name;
          if (!functionName) {
            continue;
          }
          const rawArgs = tc.function?.arguments || '{}';
          let parsedArgs: any = {};
          try {
            parsedArgs = JSON.parse(rawArgs);
          } catch {
            parsedArgs = {};
          }

          const toolResult = await this.executeTool(functionName, parsedArgs);
          this.emit({
            type: 'agent.tool_executed',
            payload: { sessionId, toolName: functionName, args: parsedArgs, result: toolResult }
          });

          messages.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: JSON.stringify(toolResult ?? {})
          } as any);
        }
      }
      
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

  private toOpenAITools(toolDefs: any[]): any[] {
    return toolDefs.map((toolDef) => {
      const properties: Record<string, any> = {};
      const required: string[] = [];

      for (const param of toolDef.parameters || []) {
        properties[param.name] = {
          type: param.type,
          description: param.description
        };
        if (param.required) {
          required.push(param.name);
        }
      }

      return {
        type: 'function',
        function: {
          name: toolDef.name,
          description: toolDef.description,
          parameters: {
            type: 'object',
            properties,
            ...(required.length > 0 ? { required } : {})
          }
        }
      };
    });
  }
}
