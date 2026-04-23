import { EventBus } from './EventBus';
import { ContextManager } from '../services/ContextManager';
export declare class HylrichCore {
    private agentSystem;
    constructor();
    getStatus(): {
        status: string;
        agentsCount: number;
        agents: import("../types/agent").Agent[];
        uptime: number;
    };
    createAgent(config: any): Promise<import("../types/agent").Agent>;
    executeTool(toolName: string, input: any): Promise<any>;
    chat(agentId: string, message: string, sessionId?: string): Promise<{
        message: any;
        sessionId: string;
    }>;
    getEventBus(): EventBus;
    getContextManager(): ContextManager;
    listAgents(): import("../types/agent").Agent[];
    getAgent(id: string): import("../types/agent").Agent | undefined;
}
