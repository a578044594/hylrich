export declare class GrpcClient {
    private client;
    private target;
    private _isConnected;
    constructor(target?: string);
    get isConnected(): boolean;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    executeTool(toolName: string, input: any): Promise<any>;
    healthCheck(): Promise<any>;
    getMetrics(): Promise<any>;
    getSystemStats(): Promise<any>;
}
