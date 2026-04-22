import { Agent, AgentConfig, Message } from '../types/agent';
import { ToolRegistry } from './ToolRegistry';
import { EventBus } from '../core/EventBus';
import { ContextManager } from './ContextManager';

export abstract class BaseAgent implements Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  state: 'idle' | 'running' | 'error' = 'idle';
  metadata?: Record<string, any>;

  protected toolRegistry: ToolRegistry;
  protected eventBus: EventBus;
  protected context: ContextManager;
  protected systemPrompt?: string;
  protected model?: string;

  constructor(config: AgentConfig, toolRegistry: ToolRegistry, eventBus: EventBus, context: ContextManager) {
    this.id = config.id || `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.name = config.name;
    this.description = config.description;
    this.capabilities = config.capabilities || [];
    this.toolRegistry = toolRegistry;
    this.eventBus = eventBus;
    this.context = context;
    this.systemPrompt = config.systemPrompt;
    this.model = config.model;
  }

  abstract async processMessage(message: string, sessionId: string): Promise<Message>;

  async executeTool(toolName: string, input: any): Promise<any> {
    return this.toolRegistry.execute(toolName, input, { agentId: this.id });
  }

  getDefinition(): Agent {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      capabilities: this.capabilities,
      tools: this.toolRegistry.list(),
      state: this.state,
      metadata: this.metadata
    };
  }

  protected emit(event: { type: string; payload?: any }) {
    this.eventBus.emit({
      type: event.type,
      agentId: this.id,
      timestamp: Date.now(),
      payload: event.payload || {}
    });
  }
}
