import { ToolDefinition } from './tool';
export interface Agent {
    id: string;
    name: string;
    description: string;
    capabilities: string[];
    tools: ToolDefinition[];
    state: 'idle' | 'running' | 'error';
    metadata?: Record<string, any>;
}
export interface AgentConfig {
    id?: string;
    name: string;
    description: string;
    capabilities?: string[];
    tools?: string[];
    systemPrompt?: string;
    model?: string;
}
