import * as grpc from '@grpc/grpc-js';
import { ToolRequest, ToolResponse, MetricsRequest, MetricsResponse, HealthRequest, HealthResponse, MetricUpdate, HealthUpdate } from '../../generated/agent';
export interface GrpcClientConfig {
    host: string;
    port: number;
    credentials?: grpc.ChannelCredentials;
}
export declare class GrpcClient {
    private config;
    private client;
    constructor(config: GrpcClientConfig);
    private setupClient;
    executeTool(request: ToolRequest): Promise<ToolResponse>;
    getMetrics(request: MetricsRequest): Promise<MetricsResponse>;
    healthCheck(request: HealthRequest): Promise<HealthResponse>;
    streamTools(requests: AsyncIterable<ToolRequest>): AsyncIterable<ToolResponse>;
    streamMetrics(request: MetricsRequest): AsyncIterable<MetricUpdate>;
    streamHealth(request: HealthRequest): AsyncIterable<HealthUpdate>;
    close(): void;
}
