import { Server, ServerCredentials } from '@grpc/grpc-js';
import { promisify } from 'util';
import { Tool } from '../../core/Tool';
import { EnhancedMCPTool } from '../../tools/EnhancedMCPTool';
import { BasicMetricsCollector } from '../../monitoring/BasicMetricsCollector';
import { AgentService } from '../../generated/agent'; // 修正导入

interface GRPCServiceConfig {
  port: number;
  host?: string;
}

interface ToolExecutionMetrics {
  startTime: number;
  endTime?: number;
  success?: boolean;
  error?: string;
}

interface MetricData {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

interface MetricSummary {
  count: number;
  sum: number;
  average: number;
  min: number;
  max: number;
}

export class GRPCService implements AgentService {
  private server: Server;
  private enhancedTool: EnhancedMCPTool;
  private metricsCollector: BasicMetricsCollector;
  private executionMetrics: Map<string, ToolExecutionMetrics> = new Map();

  constructor(private config: GRPCServiceConfig) {
    this.server = new Server();
    this.enhancedTool = new EnhancedMCPTool();
    this.metricsCollector = new BasicMetricsCollector();
    
    this.setupService();
  }

  private setupService(): void {
    // 注册gRPC服务方法
    this.server.addService(AgentService, {
      executeTool: this.executeTool.bind(this),
      checkHealth: this.checkHealth.bind(this),
      getMetrics: this.getMetrics.bind(this),
      getSystemStats: this.getSystemStats.bind(this),
      streamTools: this.streamTools.bind(this),
      streamMetrics: this.streamMetrics.bind(this),
      streamHealth: this.streamHealth.bind(this)
    });
  }

  async executeTool(call: any, callback: any): Promise<void> {
    const request = call.request as ToolExecutionRequest;
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 记录执行开始
    this.executionMetrics.set(executionId, {
      startTime: Date.now()
    });

    try {
      console.log(`Executing tool: ${request.toolName}`);
      
      const result = await this.enhancedTool.execute({
        tool_name: request.tool_name,
        parameters: request.parameters || {}
      });

      // 记录执行成功
      this.executionMetrics.get(executionId)!.endTime = Date.now();
      this.executionMetrics.get(executionId)!.success = true;

      const executionTime = Date.now() - this.executionMetrics.get(executionId)!.startTime;
      
      const response: ToolExecutionResponse = {
        success: true,
        result: JSON.stringify(result),
        executionTime,
        executionId
      };

      callback(null, response);
    } catch (error) {
      // 记录执行失败
      this.executionMetrics.get(executionId)!.endTime = Date.now();
      this.executionMetrics.get(executionId)!.success = false;
      this.executionMetrics.get(executionId)!.error = error.message;

      const executionTime = Date.now() - this.executionMetrics.get(executionId)!.startTime;
      
      const response: ToolExecutionResponse = {
        success: false,
        error: error.message,
        executionTime,
        executionId
      };

      callback(null, response);
    }
  }

  async checkHealth(call: any, callback: any): Promise<void> {
    const request = call.request as HealthCheckRequest;
    
    const response: HealthCheckResponse = {
      status: 'SERVING',
      services: ['agent'],
      timestamp: Date.now(),
      version: '1.0.0'
    };

    callback(null, response);
  }

  async getMetrics(call: any, callback: any): Promise<void> {
    const request = call.request as MetricsRequest;
    
    const metrics: MetricData[] = [
      {
        name: 'tool_execution_count',
        value: this.executionMetrics.size,
        timestamp: Date.now(),
        tags: { service: 'agent' }
      },
      {
        name: 'successful_executions',
        value: Array.from(this.executionMetrics.values()).filter(m => m.success).length,
        timestamp: Date.now(),
        tags: { service: 'agent' }
      },
      {
        name: 'failed_executions',
        value: Array.from(this.executionMetrics.values()).filter(m => !m.success).length,
        timestamp: Date.now(),
        tags: { service: 'agent' }
      }
    ];

    const response: MetricsResponse = {
      metrics: metrics.map(m => ({
        name: m.name,
        value: m.value,
        timestamp: m.timestamp,
        tags: m.tags || {}
      }))
    };

    callback(null, response);
  }

  async getSystemStats(call: any, callback: any): Promise<void> {
    const request = call.request as SystemStatsRequest;
    
    const response: SystemStatsResponse = {
      totalTools: 1, // 目前只有EnhancedMCPTool
      activeConnections: 0,
      memoryUsage: process.memoryUsage().heapUsed,
      uptime: process.uptime(),
      timestamp: Date.now()
    };

    callback(null, response);
  }

  streamTools(call: any): void {
    // 流式工具执行（待实现）
    call.write({
      toolName: 'stream_tool',
      message: 'Streaming not yet implemented'
    });
    call.end();
  }

  streamMetrics(call: any): void {
    // 流式指标监控（待实现）
    const interval = setInterval(() => {
      call.write({
        name: 'stream_metric',
        value: Math.random() * 100,
        timestamp: Date.now()
      });
    }, 1000);

    call.on('cancelled', () => {
      clearInterval(interval);
    });
  }

  streamHealth(call: any): void {
    // 流式健康检查（待实现）
    const interval = setInterval(() => {
      call.write({
        status: 'SERVING',
        timestamp: Date.now()
      });
    }, 5000);

    call.on('cancelled', () => {
      clearInterval(interval);
    });
  }

  async start(): Promise<void> {
    const startAsync = promisify(this.server.bindAsync).bind(this.server);
    
    await startAsync(
      `${this.config.host || '0.0.0.0'}:${this.config.port}`,
      ServerCredentials.createInsecure()
    );
    
    console.log(`gRPC server started on port ${this.config.port}`);
  }

  async stop(): Promise<void> {
    const shutdownAsync = promisify(this.server.tryShutdown).bind(this.server);
    await shutdownAsync();
    console.log('gRPC server stopped');
  }
}
