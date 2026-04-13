import { Tool } from '../core/Tool';
export interface MCPExecutionMetrics {
    startTime: number;
    endTime?: number;
    success?: boolean;
    error?: string;
    executionTime?: number;
}
export declare abstract class EnhancedMCPTool extends Tool {
    protected executionHistory: MCPExecutionMetrics[];
    protected executionCount: number;
    constructor();
    protected recordExecution(metrics: MCPExecutionMetrics): void;
    getPerformanceStats(): {
        totalExecutions: number;
        errorCount: number;
        errorRate: number;
        successRate: number;
        averageExecutionTime: number;
    };
    protected abstract performExecution(input: any): Promise<any>;
    execute(input: any): Promise<any>;
}
