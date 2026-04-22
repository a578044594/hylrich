export interface ToolParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    description: string;
    required?: boolean;
    default?: any;
}
export interface ToolDefinition {
    name: string;
    description: string;
    version: string;
    parameters: ToolParameter[];
}
export interface ToolExecutionContext {
    agentId?: string;
    sessionId?: string;
    metadata?: Record<string, any>;
}
export interface ToolResult {
    status: 'success' | 'error';
    data?: any;
    error?: string;
}
