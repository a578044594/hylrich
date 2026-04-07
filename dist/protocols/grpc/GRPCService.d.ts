export interface GRPCServiceConfig {
    port: number;
    protoPath: string;
}
export declare class GRPCService {
    private server;
    private config;
    private enhancedTool;
    private metricsCollector;
    constructor(config: GRPCServiceConfig);
    private setupServices;
    private executeTool;
    private getSystemHealth;
    private streamMetrics;
    start(): Promise<void>;
    stop(): Promise<void>;
}
