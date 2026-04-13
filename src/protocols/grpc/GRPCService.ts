import { Server, ServerCredentials } from '@grpc/grpc-js';
import { AgentService } from '../../generated/agent';
import { Tool } from '../../core/Tool';

export class GRPCService {
  private server: Server;
  private port: number;

  constructor(port: number = 50051) {
    this.port = port;
    this.server = new Server();
    this.setupServices();
  }

  private setupServices(): void {
    // 实现AgentService接口
    const agentServiceImpl = {
      executeTool: this.executeTool.bind(this),
      healthCheck: this.healthCheck.bind(this),
      getMetrics: this.getMetrics.bind(this),
      getSystemStats: this.getSystemStats.bind(this)
    };

    // 注册服务
    this.server.addService(AgentService, agentServiceImpl);
  }

  private async executeTool(call: any, callback: any): Promise<void> {
    try {
      const { tool_name, input } = call.request;
      console.log(`📡 gRPC调用工具: ${tool_name}`);
      
      // 这里需要实现工具执行逻辑
      const result = `工具 ${tool_name} 执行结果`;
      
      callback(null, { result });
    } catch (error) {
      callback(null, { error: (error as Error).message });
    }
  }

  private async healthCheck(call: any, callback: any): Promise<void> {
    callback(null, { 
      healthy: true, 
      status: '服务运行正常' 
    });
  }

  private async getMetrics(call: any, callback: any): Promise<void> {
    callback(null, { 
      metrics: {
        'active_connections': 0,
        'request_count': 0,
        'error_rate': 0
      }
    });
  }

  private async getSystemStats(call: any, callback: any): Promise<void> {
    callback(null, {
      cpu_usage: 0.1,
      memory_usage: 0.2,
      active_connections: 0
    });
  }

  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.bindAsync(
        `0.0.0.0:${this.port}`,
        ServerCredentials.createInsecure(),
        (error, port) => {
          if (error) {
            reject(error);
          } else {
            console.log(`🚀 gRPC服务启动在端口 ${port}`);
            resolve();
          }
        }
      );
    });
  }

  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.tryShutdown(() => {
        console.log('🛑 gRPC服务已停止');
        resolve();
      });
    });
  }
}
