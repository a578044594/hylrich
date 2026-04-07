import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';
import { FileReadTool } from '../../tools/FileReadTool';
import { BasicMetricsCollector } from '../../monitoring/BasicMetricsCollector';

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
    this.setupServices();
  }
  
  private setupServices() {
    // 加载proto文件
    const packageDefinition = protoLoader.loadSync(
      join(__dirname, '../protos/agent.proto'),
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
      }
    );
    
    const proto = grpc.loadPackageDefinition(packageDefinition) as any;
    
    // 正确的proto结构访问
    const agentPackage = proto.openclaw?.agent;
    if (!agentPackage || !agentPackage.AgentService) {
      throw new Error('Failed to load AgentService from proto definition');
    }
    
    // 添加AgentService实现
    this.server.addService(
      agentPackage.AgentService.service,
      {
        ExecuteTool: this.executeTool.bind(this),
        GetSystemHealth: this.getSystemHealth.bind(this),
        StreamMetrics: this.streamMetrics.bind(this)
      }
    );
    
    console.log('gRPC services setup completed');
  }
  
  private async executeTool(call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) {
    const startTime = Date.now();
    
    try {
      const { tool_name, input_data } = call.request;
      
      // 目前只支持file_read工具
      if (tool_name !== 'file_read') {
        throw new Error(`不支持的工具: ${tool_name}`);
      }
      
      // 解析输入数据
      const input = JSON.parse(input_data.toString());
      
      // 执行工具
      const result = await this.fileReadTool.execute(input);
      
      const executionTime = Date.now() - startTime;
      
      // 记录指标
      this.metricsCollector.recordMetric('grpc_tool_execution_time', executionTime, {
        tool: tool_name,
        success: 'true'
      });
      
      callback(null, {
        success: true,
        result_data: Buffer.from(JSON.stringify(result)),
        execution_time_ms: executionTime
      });
    } catch (error: unknown) {
      const executionTime = Date.now() - startTime;
      const err = error as Error;
      
      this.metricsCollector.recordMetric('grpc_tool_execution_time', executionTime, {
        tool: call.request.tool_name,
        success: 'false',
        error: err.message
      });
      
      callback(null, {
        success: false,
        error_message: err.message,
        execution_time_ms: executionTime
      });
    }
  }
  
  private getSystemHealth(call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) {
    const healthData = {
      timestamp: Date.now(),
      tool_count: 1, // 目前只有一个工具
      active_connections: 0, // 需要实现连接计数
      active_agents: 1,
      status: 'healthy'
    };
    
    callback(null, healthData);
  }
  
  private streamMetrics(call: grpc.ServerWritableStream<any, any>) {
    const { interval_ms } = call.request;
    const interval = interval_ms || 1000;
    
    const timer = setInterval(() => {
      if (call.cancelled) {
        clearInterval(timer);
        return;
      }
      
      const metrics = {
        timestamp: Date.now(),
        cpu_usage: Math.random() * 100, // 模拟CPU使用率
        memory_usage_mb: process.memoryUsage().heapUsed / 1024 / 1024,
        message_throughput: Math.floor(Math.random() * 1000) // 模拟消息吞吐量
      };
      
      call.write(metrics);
    }, interval);
    
    call.on('cancelled', () => {
      clearInterval(timer);
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
          } else {
            console.log(`gRPC server running on port ${port}`);
            this.server.start();
            resolve();
          }
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
