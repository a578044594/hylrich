import { Agent, AgentConfig } from '../types/agent';
import { Message } from '../types/message';
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

  // Provide tools as a getter from the tool registry
  get tools(): any[] {
    return this.toolRegistry.list();
  }

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

  abstract processMessage(message: string, sessionId: string): Promise<Message>;

  async executeTool(toolName: string, input: any): Promise<any> {
    return this.toolRegistry.execute(toolName, input, { agentId: this.id });
  }

  getDefinition(): Agent {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      capabilities: this.capabilities,
      tools: this.tools,
      state: this.state,
      metadata: this.metadata
    };
  }

  protected emit(event: any) {
    this.eventBus.emit(event);
  }
}
