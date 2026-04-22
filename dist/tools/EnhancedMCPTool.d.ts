import { Tool, ToolInput, ToolExecutionMetrics, ToolOutput } from './types/Tool';
export interface EnhancedMCPInput extends ToolInput {
    serverUrl?: string;
}
export declare class EnhancedMCPTool implements Tool {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            serverUrl: {
                type: string;
                description: string;
            };
            toolName: {
                type: string;
                description: string;
            };
            input: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    private client;
    private executionCount;
    private errorCount;
    private executionHistory;
    constructor();
    performExecution(input: any): Promise<ToolOutput>;
    getPerformanceStats(): {
        totalExecutions: number;
        errorCount: number;
        errorRate: number;
        successRate: number;
        executionHistory: ToolExecutionMetrics[];
    };
}
