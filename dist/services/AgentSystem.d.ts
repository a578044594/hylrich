import { EventEmitter } from '../core/EventEmitter';
export interface AgentSystemConfig {
    webSocketUrl?: string;
    grpcPort?: number;
}
export declare class AgentSystem extends EventEmitter {
    private config;
    private webSocketBus?;
    private grpcProtocol?;
    private mcpTool?;
    private isRunning;
    constructor(config?: AgentSystemConfig);
    start(): Promise<void>;
    stop(): Promise<void>;
    private handleWebSocketMessage;
    getStatus(): {
        running: boolean;
        webSocketConnected: boolean;
        grpcRunning: boolean;
    };
    executeTool(toolName: string, input: any): Promise<any>;
}
