import { Server, ServerCredentials } from '@grpc/grpc-js';
import { agent } from '../../generated/agent';

export class GRPCService {
  private server: Server;
  private port: number;
  private isRunning: boolean = false;

  constructor(port: number = 50051) {
    this.port = port;
    this.server = new Server();
  }

  private setupServices(): void {
    // 简化的服务实现
    const agentServiceImpl: agent.IAgentService = {
      ExecuteTool: async (call: any, callback: any) => {
        try {
          const { tool_name, input } = call.request;
          console.log(`📡 gRPC调用工具: ${tool_name}`);
          callback(null, { result: `执行成功: ${tool_name}`, error: '' });
        } catch (error: any) {
          callback(null, { result: '', error: error.message });
        }
      },
      HealthCheck: async (call: any, callback: any) => {
        callback(null, { healthy: this.isRunning, status: this.isRunning ? '服务运行正常' : '服务未就绪' });
      },
      GetMetrics: async (call: any, callback: any) => {
        callback(null, { metrics: { connections: 0, requests: 0, errors: 0 } });
      },
      GetSystemStats: async (call: any, callback: any) => {
        callback(null, { cpu_usage: 0.1, memory_usage: 0.2, active_connections: 0 });
      }
    };

    // 使用类型断言添加服务
    this.server.addService(agent.AgentService as any, agentServiceImpl);
  }

  public async start(): Promise<void> {
    try {
      this.setupServices();
      
      await new Promise<void>((resolve, reject) => {
        this.server.bindAsync(
          `0.0.0.0:${this.port}`,
          ServerCredentials.createInsecure(),
          (error: any) => {
            if (error) reject(error);
            else {
              this.server.start();
              this.isRunning = true;
              console.log(`🚀 gRPC服务启动在端口 ${this.port}`);
              resolve();
            }
          }
        );
      });
    } catch (error) {
      console.warn('⚠️ gRPC启动失败，将跳过:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.isRunning) {
        this.server.tryShutdown(() => {
          this.isRunning = false;
          console.log('🛑 gRPC服务已停止');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  public isServiceRunning(): boolean {
    return this.isRunning;
  }
}
