import { Tool } from "../core/Tool";
export interface MCPExecutionMetrics {
    startTime: number;
    endTime?: number;
    success?: boolean;
    error?: any;
    memoryUsage?: number;
}
export declare abstract class EnhancedMCPTool extends Tool {
    private executionHistory;
    private maxHistorySize;
    execute(input: any): Promise<any>;
    protected abstract executeInternal(input: any): Promise<any>;
    private addToHistory;
    getExecutionHistory(): MCPExecutionMetrics[];
    getPerformanceReport(): {
        totalExecutions: any;
        successRate: number;
        averageExecutionTime: any;
        recentHistory: MCPExecutionMetrics[];
    };
}
