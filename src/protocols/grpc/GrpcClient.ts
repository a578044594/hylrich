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
  private stateCallbacks: Map<string, (update: any) => void> = new Map();
  private activeStreams: Set<grpc.ClientReadableStream<any>> = new Set();

  constructor(config: GrpcClientConfig) {
    this.config = config;
    this.setupClient();
  }

  private setupClient() {
    // 加载proto文件 - 支持多个可能的路径
    let protoPath = join(__dirname, '../protos/agent.proto');
    if (!require('fs').existsSync(protoPath)) {
      // 如果不存在，尝试项目根目录
      protoPath = join(__dirname, '../../protos/agent.proto');
    }
    
    const packageDefinition = protoLoader.loadSync(protoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    });

    const proto = grpc.loadPackageDefinition(packageDefinition) as any;
    
    // 正确的proto结构访问
    const agentPackage = proto.openclaw?.agent;
    if (!agentPackage || !agentPackage.AgentService) {
      throw new Error('Failed to load AgentService from proto definition');
    }
    
    // 创建客户端
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

    this.activeStreams.add(call);
    
    // 返回取消函数
    return () => {
      call.cancel();
      this.activeStreams.delete(call);
    };
  }

  /**
   * 订阅状态更新流
   */
  streamStateUpdates(
    clientId: string, 
    filterPrefix?: string,
    callback: (update: any) => void
  ): () => void {
    const call = this.client.StreamStateUpdates({
      client_id: clientId,
      filter_prefix: filterPrefix || ''
    });

    call.on('data', (update: any) => {
      callback(update);
    });

    call.on('error', (error: Error) => {
      console.error('State stream error:', error);
    });

    call.on('end', () => {
      console.log('State stream ended');
    });

    this.activeStreams.add(call);
    this.stateCallbacks.set(clientId, callback);

    // 返回取消函数
    return () => {
      call.cancel();
      this.activeStreams.delete(call);
      this.stateCallbacks.delete(clientId);
    };
  }

  /**
   * 发布状态变更
   */
  async publishState(key: string, value: any, source: string): Promise<boolean> {
    try {
      const response = await new Promise((resolve, reject) => {
        this.client.PublishState(
          {
            key,
            value: Buffer.from(JSON.stringify(value)),
            source,
            timestamp: Date.now()
          },
          (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          }
        );
      });
      return response.accepted;
    } catch (error) {
      console.error('Publish state failed:', error);
      return false;
    }
  }

  /**
   * 获取当前状态快照
   */
  async getCurrentState(filterPrefix?: string): Promise<Record<string, any>> {
    try {
      const response = await new Promise((resolve, reject) => {
        this.client.GetCurrentState(
          { filter_prefix: filterPrefix || '' },
          (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          }
        );
      });

      const snapshot: Record<string, any> = {};
      if (response.state) {
        for (const [key, value] of Object.entries(response.state)) {
          snapshot[key] = JSON.parse(value.toString());
        }
      }
      return { snapshot, timestamp: response.timestamp };
    } catch (error) {
      console.error('Get state snapshot failed:', error);
      return { snapshot: {}, timestamp: Date.now() };
    }
  }

  /**
   * 关闭所有连接
   */
  close(): void {
    for (const stream of this.activeStreams) {
      stream.cancel();
    }
    this.activeStreams.clear();
    grpc.closeClient(this.client);
  }
}
