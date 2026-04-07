// 手动生成的类型文件 - 基于agent.proto

export interface ToolRequest {
  tool_name: string;
  input_data: Uint8Array;
}

export interface ToolResponse {
  success: boolean;
  result_data: Uint8Array;
  error_message: string;
  execution_time_ms: number;
}

export interface MetricsRequest {
  metric_name: string;
}

export interface MetricsResponse {
  summaries: { [key: string]: MetricSummary };
}

export interface MetricSummary {
  count: number;
  sum: number;
  average: number;
  min: number;
  max: number;
}

export interface HealthRequest {}

export interface HealthResponse {
  status: string;
  timestamp: string;
  services: { [key: string]: boolean };
}

// 新增流式消息类型
export interface MetricUpdate {
  metric_name: string;
  value: number;
  labels: { [key: string]: string };
  timestamp: number;
}

export interface HealthUpdate {
  service_name: string;
  healthy: boolean;
  status_message: string;
  timestamp: number;
}

// 服务接口
export interface IAgentService {
  executeTool(request: ToolRequest): Promise<ToolResponse>;
  getMetrics(request: MetricsRequest): Promise<MetricsResponse>;
  healthCheck(request: HealthRequest): Promise<HealthResponse>;
  
  // 流式方法
  streamTools(requests: AsyncIterable<ToolRequest>): AsyncIterable<ToolResponse>;
  streamMetrics(request: MetricsRequest): AsyncIterable<MetricUpdate>;
  streamHealth(request: HealthRequest): AsyncIterable<HealthUpdate>;
}
