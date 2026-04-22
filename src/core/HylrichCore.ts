import { AgentSystem } from '../services/AgentSystem';
import { EventBus } from './EventBus';
import { ContextManager } from '../services/ContextManager';

export class HylrichCore {
  private agentSystem: AgentSystem;
  
  constructor() {
    this.agentSystem = new AgentSystem();
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
    return this.agentSystem.toolRegistry.execute(toolName, input);
  }

  async chat(agentId: string, message: string, sessionId?: string) {
    return this.agentSystem.processMessage(agentId, message, sessionId);
  }

  getEventBus(): EventBus {
    return this.agentSystem.getEventBus();
  }

  getContextManager(): ContextManager {
    return this.agentSystem.getContextManager();
  }
}

  listAgents() {
    return this.agentSystem.listAgents();
  }

  getAgent(id: string) {
    return this.agentSystem.getAgent(id);
  }
