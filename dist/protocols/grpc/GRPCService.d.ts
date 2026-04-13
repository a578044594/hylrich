export declare class GRPCService {
    private server;
    private port;
    constructor(port?: number);
    private setupServices;
    private executeTool;
    private healthCheck;
    private getMetrics;
    private getSystemStats;
    start(): Promise<void>;
    stop(): Promise<void>;
}
