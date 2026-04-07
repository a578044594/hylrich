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
    // 加载proto文件
    const packageDefinition = protoLoader.loadSync(
      join(__dirname, '../../protos/agent.proto'),
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

    // 返回取消函数
    return () => {
      call.cancel();
    };
  }

  close(): void {
    grpc.closeClient(this.client);
  }
}
