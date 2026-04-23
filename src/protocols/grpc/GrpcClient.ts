import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';

export interface GrpcClientConfig {
  host: string;
  port: number;
  credentials?: grpc.ChannelCredentials;
}

export class GrpcClient {
  private client: any;
  private config: GrpcClientConfig;

  constructor(config: GrpcClientConfig) {
    this.config = config;
    this.setupClient();
  }

  private setupClient() {
    let protoPath = join(__dirname, '../../protos/agent.proto');
    if (!require('fs').existsSync(protoPath)) {
      protoPath = join(__dirname, '../../../protos/agent.proto');
    }

    const packageDefinition = protoLoader.loadSync(protoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    });

    const proto = grpc.loadPackageDefinition(packageDefinition) as any;
    const agentPackage = proto.openclaw?.agent;
    
    if (!agentPackage || !agentPackage.AgentService) {
      throw new Error('Failed to load AgentService from proto definition');
    }
    
    this.client = new agentPackage.AgentService(
      `${this.config.host}:${this.config.port}`,
      this.config.credentials || grpc.credentials.createInsecure()
    );
  }

  async executeTool(toolName: string, input: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.ExecuteTool(
        {
          tool_name: toolName,
          input_data: Buffer.from(JSON.stringify(input))
        },
        (error: any, response: any) => {
          if (error) {
            reject(error);
          } else {
            if (response.success) {
              resolve(JSON.parse(response.result_data.toString()));
            } else {
              reject(new Error(response.error_message));
            }
          }
        }
      );
    });
  }

  async getSystemHealth(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.GetSystemHealth(
        {},
        (error: any, response: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  streamMetrics(intervalMs: number = 1000, callback: (metrics: any) => void): () => void {
    const call = this.client.StreamMetrics({ interval_ms: intervalMs });
    
    call.on('data', (metrics: any) => {
      callback(metrics);
    });

    call.on('error', (error: Error) => {
      console.error('gRPC stream error:', error);
    });

    call.on('end', () => {
      console.log('gRPC stream ended');
    });

    return () => {
      call.cancel();
    };
  }

  /**
   * 流式接收状态更新
   * @param callback 接收状态更新
   * @returns 取消订阅函数
   */
  streamStateUpdates(callback: (update: any) => void): () => void {
    const call = this.client.StreamStateUpdates({});
    
    call.on('data', (update: any) => {
      callback(update);
    });

    call.on('error', (error: Error) => {
      console.error('State sync stream error:', error);
    });

    call.on('end', () => {
      console.log('State sync stream ended');
    });

    return () => {
      call.cancel();
    };
  }

  /**
   * 发布状态变更
   */
  async publishState(key: string, value: any, source: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.client.PublishState(
        {
          key,
          value: JSON.stringify(value),
          source,
          timestamp: Date.now()
        },
        (error: any, response: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(response.accepted);
          }
        }
      );
    });
  }

  /**
   * 获取当前状态快照
   */
  async getCurrentState(filterPrefix?: string): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
      this.client.GetCurrentState(
        { filter_prefix: filterPrefix || '' },
        (error: any, response: any) => {
          if (error) {
            reject(error);
          } else {
            const snapshot: Record<string, any> = {};
            for (const [key, buffer] of Object.entries(response.state || {})) {
              snapshot[key] = JSON.parse(buffer.toString());
            }
            resolve(snapshot);
          }
        }
      );
    });
  }

  close(): void {
    // grpc-js does not have closeClient, just keep the object
    // The client streams will close when cancelled
  }
}
