import { Agent, AgentConfig } from '../types/agent';
import { ToolRegistry } from './ToolRegistry';
import { EventBus } from '../core/EventBus';
import { ContextManager } from './ContextManager';
export declare class AgentSystem {
    private agents;
    readonly toolRegistry: ToolRegistry;
    private eventBus;
    private context;
    constructor();
    private registerDefaultTools;
    createAgent(config: AgentConfig): Promise<Agent>;
    getAgent(id: string): Agent | undefined;
    listAgents(): Agent[];
    processMessage(agentId: string, message: string, sessionId?: string): Promise<any>;
    getEventBus(): EventBus;
    getContextManager(): ContextManager;
}
