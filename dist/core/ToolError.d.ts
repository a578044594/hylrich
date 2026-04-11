export declare class ToolError extends Error {
    code?: string | undefined;
    constructor(message: string, code?: string | undefined);
}
export declare class ToolExecutionError extends ToolError {
    toolName?: string | undefined;
    constructor(message: string, toolName?: string | undefined);
}
export declare class ToolValidationError extends ToolError {
    field?: string | undefined;
    constructor(message: string, field?: string | undefined);
}
