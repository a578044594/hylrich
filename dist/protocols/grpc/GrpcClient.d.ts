import * as grpc from '@grpc/grpc-js';
export interface GrpcClientConfig {
    host: string;
    port: number;
    credentials?: grpc.ChannelCredentials;
}
export declare class GrpcClient {
    private client;
    private config;
    constructor(config: GrpcClientConfig);
    private setupClient;
    executeTool(toolName: string, input: any): Promise<any>;
    getSystemHealth(): Promise<any>;
    streamMetrics(intervalMs: number | undefined, callback: (metrics: any) => void): () => void;
    close(): void;
}
