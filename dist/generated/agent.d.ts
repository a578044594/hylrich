import * as grpc from '@grpc/grpc-js';
export declare namespace agent {
    interface ToolExecutionRequest {
        tool_name: string;
        input: string;
    }
    interface ToolExecutionResponse {
        result: string;
        error: string;
    }
    interface HealthCheckRequest {
    }
    interface HealthCheckResponse {
        healthy: boolean;
        status: string;
    }
    interface MetricsRequest {
    }
    interface MetricsResponse {
        metrics: {
            [key: string]: number;
        };
    }
    interface SystemStatsRequest {
    }
    interface SystemStatsResponse {
        cpu_usage: number;
        memory_usage: number;
        active_connections: number;
    }
    interface IAgentService {
        ExecuteTool(call: grpc.ServerUnaryCall<ToolExecutionRequest, ToolExecutionResponse>, callback: grpc.sendUnaryData<ToolExecutionResponse>): void;
        HealthCheck(call: grpc.ServerUnaryCall<HealthCheckRequest, HealthCheckResponse>, callback: grpc.sendUnaryData<HealthCheckResponse>): void;
        GetMetrics(call: grpc.ServerUnaryCall<MetricsRequest, MetricsResponse>, callback: grpc.sendUnaryData<MetricsResponse>): void;
        GetSystemStats(call: grpc.ServerUnaryCall<SystemStatsRequest, SystemStatsResponse>, callback: grpc.sendUnaryData<SystemStatsResponse>): void;
    }
}
