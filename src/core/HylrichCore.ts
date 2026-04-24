import { AgentSystem } from '../services/AgentSystem';
import { AgentSystemOptions } from '../services/AgentSystem';
import { EventBus } from './EventBus';
import { ContextManager } from '../services/ContextManager';

export class HylrichCore {
  private agentSystem: AgentSystem;
  
  constructor(options?: AgentSystemOptions) {
    this.agentSystem = new AgentSystem(options);
  }

  async start(): Promise<void> {
    await this.agentSystem.start();
  }

  async stop(): Promise<void> {
    await this.agentSystem.stop();
  }

  getStatus() {
    const agents = this.agentSystem.listAgents();
    return {
      status: 'active',
      agentsCount: agents.length,
      agents: agents,
      uptime: process.uptime()
    };
  }

  async createAgent(config: any) {
    return this.agentSystem.createAgent(config);
  }

  async executeTool(toolName: string, input: any) {
    return this.agentSystem.executeTool(toolName, input);
  }

  async chat(agentId: string, message: string, sessionId?: string) {
    return this.agentSystem.chat(agentId, message, sessionId);
  }

  getEventBus(): EventBus {
    return this.agentSystem.getEventBus();
  }

  getContextManager(): ContextManager {
    return this.agentSystem.getContextManager();
  }

  listAgents() {
    return this.agentSystem.listAgents();
  }

  getAgent(id: string) {
    return this.agentSystem.getAgent(id);
  }
}
