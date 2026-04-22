import { Agent, AgentConfig } from '../types/agent';
import { BaseAgent } from './BaseAgent';
import { ToolRegistry } from './ToolRegistry';
import { EventBus } from '../core/EventBus';
import { ContextManager } from './ContextManager';
import { OpenAIAgent } from './OpenAIAgent';
import { FileWriteTool, FileReadTool } from '../tools/FileTools';

export class AgentSystem {
  private agents: Map<string, BaseAgent> = new Map();
  public readonly toolRegistry: ToolRegistry;
  private eventBus: EventBus;
  private context: ContextManager;

  constructor() {
    this.eventBus = new EventBus();
    this.context = new ContextManager();
    this.toolRegistry = new ToolRegistry();
    this.registerDefaultTools();
  }

  private registerDefaultTools() {
    this.toolRegistry.register(FileWriteTool.definition, FileWriteTool.execute);
    this.toolRegistry.register(FileReadTool.definition, FileReadTool.execute);
  }

  async createAgent(config: AgentConfig): Promise<Agent> {
    let agent: BaseAgent;
    if (config.capabilities?.includes('openai') || !config.capabilities) {
      agent = new OpenAIAgent(config, this.toolRegistry, this.eventBus, this.context);
    } else {
      throw new Error('Unknown agent type');
    }

    this.agents.set(agent.id, agent);
    this.eventBus.emit({ type: 'agent.created', payload: { agentId: agent.id, name: agent.name } });
    return agent.getDefinition();
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id)?.getDefinition();
  }

  listAgents(): Agent[] {
    return Array.from(this.agents.values()).map(a => a.getDefinition());
  }

  async processMessage(agentId: string, message: string, sessionId?: string): Promise<any> {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);
    const sid = sessionId || `session-${agentId}-${Date.now()}`;
    const result = await agent.processMessage(message, sid);
    return { message: result, sessionId: sid };
  }

  getEventBus(): EventBus {
    return this.eventBus;
  }

  getContextManager(): ContextManager {
    return this.context;
  }
}
