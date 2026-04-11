export interface ToolInputJSONSchema {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
}
export interface ToolExecutionMetrics {
    startTime: number;
    endTime?: number;
    success: boolean;
    error?: Error;
}
export declare abstract class Tool {
    abstract name: string;
    abstract description: string;
    abstract parameters: ToolInputJSONSchema;
    private executionCount;
    private errorCount;
    private executionHistory;
    execute(input: any): Promise<any>;
    protected validateInput(input: any): void;
    protected abstract performExecution(input: any): Promise<any>;
    getPerformanceStats(): {
        totalExecutions: number;
        errorCount: number;
        errorRate: number;
        successRate: number;
        executionHistory: ToolExecutionMetrics[];
    };
    resetStats(): void;
}
