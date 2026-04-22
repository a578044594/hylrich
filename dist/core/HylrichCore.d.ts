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
    executeTool(toolName: string, input: any): Promise<import("../types/tool").ToolResult>;
    chat(agentId: string, message: string, sessionId?: string): Promise<any>;
    getEventBus(): EventBus;
    getContextManager(): ContextManager;
}
