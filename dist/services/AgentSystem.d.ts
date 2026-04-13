export declare class AgentSystem {
    private grpcProtocol;
    private websocketBus;
    constructor();
    start(): Promise<void>;
    stop(): Promise<void>;
    sendMessage(message: any): Promise<void>;
    executeTool(toolName: string, input: any): Promise<any>;
    healthCheck(): Promise<any>;
    getStatus(): {
        grpcRunning: boolean;
        websocketRunning: boolean;
    };
}
