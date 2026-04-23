import { Agent, AgentConfig } from '../types/agent';
import { ToolRegistry } from './ToolRegistry';
import { EventBus } from '../core/EventBus';
import { ContextManager } from './ContextManager';
import { DistributedStateStore, StateChangeEvent } from '../state/DistributedStateStore';
export declare class AgentSystem {
    private agents;
    readonly toolRegistry: ToolRegistry;
    private eventBus;
    private context;
    private stateStore;
    private grpcClient?;
    private nodeId;
    constructor();
    private initGrpcClient;
    private handleStateChange;
    /**
     * 发布全局状态（同步到其他节点）
     */
    publishState(key: string, value: any): Promise<boolean>;
    /**
     * 获取全局状态快照
     */
    getStateSnapshot(filterPrefix?: string): Record<string, any>;
    /**
     * 订阅全局状态变更
     */
    subscribeState(callback: (event: StateChangeEvent) => () => void): () => void;
    private registerDefaultTools;
    createAgent(config: AgentConfig): Promise<Agent>;
    getAgent(id: string): Agent | undefined;
    listAgents(): Agent[];
    processMessage(agentId: string, message: string, sessionId?: string): Promise<any>;
    executeTool(toolName: string, input: any): Promise<any>;
    executeAgentTool(agentId: string, toolName: string, input: any): Promise<any>;
    chat(agentId: string, message: string, sessionId?: string): Promise<{
        message: any;
        sessionId: string;
    }>;
    getEventBus(): EventBus;
    getContextManager(): ContextManager;
    getStateStore(): DistributedStateStore;
    private emitEvent;
}
