import { ToolDefinition, ToolResult, ToolExecutionContext } from '../types/tool';
export declare class ToolNotFoundError extends Error {
    toolName: string;
    constructor(toolName: string);
}
export declare class ToolRegistry {
    private tools;
    private executors;
    register(def: ToolDefinition, executor: (input: any, context: ToolExecutionContext) => Promise<ToolResult>): void;
    getDefinition(name: string): ToolDefinition | undefined;
    list(): ToolDefinition[];
    execute(name: string, input: any, context?: ToolExecutionContext): Promise<ToolResult>;
}
