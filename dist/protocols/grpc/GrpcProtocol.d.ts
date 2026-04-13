export declare class GrpcProtocol {
    private client;
    private _isRunning;
    constructor(target?: string);
    get isRunning(): boolean;
    start(): Promise<void>;
    stop(): Promise<void>;
    executeTool(toolName: string, input: any): Promise<any>;
    healthCheck(): Promise<any>;
    getMetrics(): Promise<any>;
    getSystemStats(): Promise<any>;
}
