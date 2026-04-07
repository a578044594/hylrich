import { AgentService } from '../../generated/agent';
interface GRPCServiceConfig {
    port: number;
    host?: string;
}
export declare class GRPCService implements AgentService {
    private config;
    private server;
    private enhancedTool;
    private metricsCollector;
    private executionMetrics;
    constructor(config: GRPCServiceConfig);
    private setupService;
    executeTool(call: any, callback: any): Promise<void>;
    checkHealth(call: any, callback: any): Promise<void>;
    getMetrics(call: any, callback: any): Promise<void>;
    getSystemStats(call: any, callback: any): Promise<void>;
    streamTools(call: any): void;
    streamMetrics(call: any): void;
    streamHealth(call: any): void;
    start(): Promise<void>;
    stop(): Promise<void>;
}
export {};
