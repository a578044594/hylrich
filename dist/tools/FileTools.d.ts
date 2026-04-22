import { ToolDefinition, ToolResult, ToolExecutionContext } from '../types/tool';
export declare const FileWriteTool: {
    definition: ToolDefinition;
    execute(input: any, context?: ToolExecutionContext): Promise<ToolResult>;
};
export declare const FileReadTool: {
    definition: ToolDefinition;
    execute(input: any, context?: ToolExecutionContext): Promise<ToolResult>;
};
