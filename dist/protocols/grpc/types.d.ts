export interface ToolExecutionRequest {
    toolName: string;
    input: any;
}
export interface ToolExecutionResponse {
    success: boolean;
    result?: any;
    error?: string;
}
export interface HealthCheckRequest {
    service: string;
}
export interface HealthCheckResponse {
    healthy: boolean;
    status: string;
}
export interface MetricsRequest {
    metricNames: string[];
}
export interface MetricsResponse {
    metrics: Record<string, number>;
}
export interface SystemStatsRequest {
    includeDetails: boolean;
}
export interface SystemStatsResponse {
    uptime: number;
    memoryUsage: number;
    activeConnections: number;
}
