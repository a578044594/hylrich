import { EnhancedMCPTool } from "./tools/EnhancedMCPTool";
export * from "./core/Tool";
export * from "./protocols/WebSocketBus";
export * from "./tools/EnhancedMCPTool";
export declare class HylrichCore {
    private tools;
    private wsBus;
    constructor();
    registerTool(tool: EnhancedMCPTool): void;
    connectWebSocket(config: {
        url: string;
        reconnectInterval?: number;
        maxReconnectAttempts?: number;
    }): Promise<void>;
    executeTool(toolName: string, input: any): Promise<any>;
    getToolStats(toolName: string): {
        totalExecutions: number;
        successRate: number;
        averageExecutionTime: number;
        recentHistory: import("./tools/EnhancedMCPTool").MCPExecutionMetrics[];
    } | null;
    shutdown(): void;
}
