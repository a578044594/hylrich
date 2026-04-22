import { Agent, AgentConfig, Message } from '../types/agent';
import { ToolRegistry } from './ToolRegistry';
import { EventBus } from '../core/EventBus';
import { ContextManager } from './ContextManager';
export declare abstract class BaseAgent implements Agent {
    id: string;
    name: string;
    description: string;
    capabilities: string[];
    state: 'idle' | 'running' | 'error';
    metadata?: Record<string, any>;
    protected toolRegistry: ToolRegistry;
    protected eventBus: EventBus;
    protected context: ContextManager;
    protected systemPrompt?: string;
    protected model?: string;
    constructor(config: AgentConfig, toolRegistry: ToolRegistry, eventBus: EventBus, context: ContextManager);
    abstract processMessage(message: string, sessionId: string): Promise<Message>;
    executeTool(toolName: string, input: any): Promise<any>;
    getDefinition(): Agent;
    protected emit(event: {
        type: string;
        payload?: any;
    }): void;
}
