interface GrpcToolResponse {
    result?: any;
    error?: any;
}
export declare class GrpcClient {
    private target;
    private _isConnected;
    constructor(target?: string);
    get isConnected(): boolean;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    executeTool(toolName: string, input: any): Promise<GrpcToolResponse>;
    healthCheck(): Promise<any>;
    getMetrics(): Promise<any>;
    getSystemStats(): Promise<any>;
}
export {};
