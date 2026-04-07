import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';
import { FileReadTool } from '../../tools/FileReadTool';
import { BasicMetricsCollector } from '../../monitoring/BasicMetricsCollector';
import { ToolRequest, ToolResponse, MetricsRequest, MetricsResponse, HealthRequest, HealthResponse, MetricUpdate, HealthUpdate } from '../../generated/agent';

export interface GRPCServiceConfig {
  port: number;
  protoPath: string;
}

export class GRPCService {
  private server: grpc.Server;
  private config: GRPCServiceConfig;
  private fileReadTool: FileReadTool;
  private metricsCollector: BasicMetricsCollector;
  
  constructor(config: GRPCServiceConfig) {
    this.config = config;
    this.server = new grpc.Server();
    this.fileReadTool = new FileReadTool();
    this.metricsCollector = new BasicMetricsCollector();
  }

  async setupServices(): Promise<void> {
    try {
      // 加载proto文件
      const packageDefinition = protoLoader.loadSync(
        this.config.protoPath,
        {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true
        }
      );

      const agentPackage = grpc.loadPackageDefinition(packageDefinition) as any;

      // 注册服务方法
      this.server.addService(agentPackage.agent.AgentService.service, {
        executeTool: this.executeTool.bind(this),
        getMetrics: this.getMetrics.bind(this),
        healthCheck: this.healthCheck.bind(this),
        
        // 新增流式方法
        streamTools: this.streamTools.bind(this),
        streamMetrics: this.streamMetrics.bind(this),
        streamHealth: this.streamHealth.bind(this),
      });

      console.log('gRPC services setup completed');
    } catch (error) {
      console.error('Failed to setup gRPC services:', error);
      throw error;
    }
  }

  private async executeTool(call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>): Promise<void> {
    const startTime = Date.now();
    
    try {
      const request = call.request as ToolRequest;
      const result = await this.fileReadTool.execute(request);
      
      const response: ToolResponse = {
        success: true,
        result_data: result,
        error_message: '',
        execution_time_ms: Date.now() - startTime
      };
      
      // 记录指标
      this.metricsCollector.recordMetric('grpc_tool_execution_time', Date.now() - startTime, {
        tool_name: request.tool_name,
        success: 'true'
      });
      
      callback(null, response);
    } catch (error) {
      const response: ToolResponse = {
        success: false,
        result_data: new Uint8Array(),
        error_message: error instanceof Error ? error.message : 'Unknown error',
        execution_time_ms: Date.now() - startTime
      };
      
      // 记录错误指标
      this.metricsCollector.recordMetric('grpc_tool_execution_time', Date.now() - startTime, {
        tool_name: call.request?.tool_name || 'unknown',
        success: 'false',
        error: error instanceof Error ? error.message : 'unknown'
      });
      
      callback(null, response);
    }
  }

  private async getMetrics(call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>): Promise<void> {
    try {
      const request = call.request as MetricsRequest;
      const metrics = this.metricsCollector.getMetrics(request.metric_name);
      
      const response: MetricsResponse = {
        summaries: metrics
      };
      
      callback(null, response);
    } catch (error) {
      const response: MetricsResponse = {
        summaries: {}
      };
      callback(null, response);
    }
  }

  private async healthCheck(call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>): Promise<void> {
    const response: HealthResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        grpc: true,
        metrics: true,
        tools: true
      }
    };
    callback(null, response);
  }

  // 新增流式方法实现
  private async streamTools(call: grpc.ServerDuplexStream<any, any>): Promise<void> {
    console.log('StreamTools connection established');
    
    call.on('data', async (request: ToolRequest) => {
      try {
        const startTime = Date.now();
        const result = await this.fileReadTool.execute(request);
        
        const response: ToolResponse = {
          success: true,
          result_data: result,
          error_message: '',
          execution_time_ms: Date.now() - startTime
        };
        
        call.write(response);
        
        // 记录指标
        this.metricsCollector.recordMetric('grpc_stream_tool_execution_time', Date.now() - startTime, {
          tool_name: request.tool_name,
          success: 'true'
        });
      } catch (error) {
        const response: ToolResponse = {
          success: false,
          result_data: new Uint8Array(),
          error_message: error instanceof Error ? error.message : 'Unknown error',
          execution_time_ms: Date.now() - Date.now()
        };
        
        call.write(response);
        
        // 记录错误指标
        this.metricsCollector.recordMetric('grpc_stream_tool_execution_time', Date.now() - Date.now(), {
          tool_name: request.tool_name || 'unknown',
          success: 'false',
          error: error instanceof Error ? error.message : 'unknown'
        });
      }
    });

    call.on('end', () => {
      console.log('StreamTools connection ended');
      call.end();
    });

    call.on('error', (error) => {
      console.error('StreamTools error:', error);
    });
  }

  private async streamMetrics(call: grpc.ServerWritableStream<any, any>): Promise<void> {
    const request = call.request as MetricsRequest;
    console.log(`StreamMetrics started for: ${request.metric_name}`);
    
    // 模拟实时指标流
    let count = 0;
    const interval = setInterval(() => {
      if (count >= 10) {
        clearInterval(interval);
        call.end();
        return;
      }
      
      const update: MetricUpdate = {
        metric_name: request.metric_name,
        value: Math.random() * 100,
        labels: { iteration: count.toString() },
        timestamp: Date.now()
      };
      
      call.write(update);
      count++;
    }, 1000);

    call.on('cancelled', () => {
      console.log('StreamMetrics cancelled');
      clearInterval(interval);
    });
  }

  private async streamHealth(call: grpc.ServerWritableStream<any, any>): Promise<void> {
    console.log('StreamHealth started');
    
    // 模拟健康检查流
    let count = 0;
    const services = ['grpc', 'metrics', 'tools', 'database', 'cache'];
    
    const interval = setInterval(() => {
      if (count >= 5) {
        clearInterval(interval);
        call.end();
        return;
      }
      
      const randomService = services[Math.floor(Math.random() * services.length)];
      const update: HealthUpdate = {
        service_name: randomService,
        healthy: Math.random() > 0.2,
        status_message: Math.random() > 0.2 ? 'OK' : 'Degraded',
        timestamp: Date.now()
      };
      
      call.write(update);
      count++;
    }, 2000);

    call.on('cancelled', () => {
      console.log('StreamHealth cancelled');
      clearInterval(interval);
    });
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.bindAsync(
        `0.0.0.0:${this.config.port}`,
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
          if (error) {
            reject(error);
            return;
          }
          
          console.log(`gRPC server running on port ${port}`);
          resolve();
        }
      );
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.tryShutdown(() => {
        console.log('gRPC server stopped');
        resolve();
      });
    });
  }
}
