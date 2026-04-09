import { Tool } from '../core/Tool';
import { MCPExecutionMetrics } from '../types/MCPExecutionMetrics';
export interface ToolParameters {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    stopSequences?: string[];
    other?: Record<string, any>;
}
export declare abstract class EnhancedMCPTool extends Tool {
    private executionHistory;
    private maxHistorySize;
    execute(input: any): Promise<any>;
    protected abstract executeInternal(input: any): Promise<any>;
    private addToHistory;
    getExecutionHistory(): MCPExecutionMetrics[];
    getPerformanceReport(): {
        totalExecutions: number;
        successRate: number;
        averageExecutionTime: number;
        recentHistory: MCPExecutionMetrics[];
    };
}
