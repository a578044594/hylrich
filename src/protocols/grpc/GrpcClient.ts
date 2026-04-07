import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';
import { ToolRequest, ToolResponse, MetricsRequest, MetricsResponse, HealthRequest, HealthResponse, MetricUpdate, HealthUpdate } from '../../generated/agent';

export interface GrpcClientConfig {
  host: string;
  port: number;
  credentials?: grpc.ChannelCredentials;
}

export class GrpcClient {
  private config: GrpcClientConfig;
  private client: any;

  constructor(config: GrpcClientConfig) {
    this.config = config;
    this.setupClient();
  }

  private setupClient(): void {
    try {
      const packageDefinition = protoLoader.loadSync(
        join(__dirname, '../../../protos/agent.proto'),
        {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true
        }
      );

      const agentPackage = grpc.loadPackageDefinition(packageDefinition) as any;

      // 创建客户端
      this.client = new agentPackage.agent.AgentService(
        `${this.config.host}:${this.config.port}`,
        this.config.credentials || grpc.credentials.createInsecure()
      );
    } catch (error) {
      console.error('Failed to setup gRPC client:', error);
      throw error;
    }
  }

  async executeTool(request: ToolRequest): Promise<ToolResponse> {
    return new Promise((resolve, reject) => {
      this.client.executeTool(request, (error: any, response: ToolResponse) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });
  }

  async getMetrics(request: MetricsRequest): Promise<MetricsResponse> {
    return new Promise((resolve, reject) => {
      this.client.getMetrics(request, (error: any, response: MetricsResponse) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });
  }

  async healthCheck(request: HealthRequest): Promise<HealthResponse> {
    return new Promise((resolve, reject) => {
      this.client.healthCheck(request, (error: any, response: HealthResponse) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });
  }

  // 新增流式方法
  streamTools(requests: AsyncIterable<ToolRequest>): AsyncIterable<ToolResponse> {
    const call = this.client.streamTools();
    
    return {
      [Symbol.asyncIterator](): AsyncIterator<ToolResponse> {
        return {
          next: async (): Promise<IteratorResult<ToolResponse>> => {
            return new Promise((resolve, reject) => {
              call.on('data', (response: ToolResponse) => {
                resolve({ value: response, done: false });
              });

              call.on('end', () => {
                resolve({ value: undefined as any, done: true });
              });

              call.on('error', (error: any) => {
                reject(error);
              });

              // 发送请求
              (async () => {
                for await (const request of requests) {
                  call.write(request);
                }
                call.end();
              })();
            });
          },
          return: async (): Promise<IteratorResult<ToolResponse>> => {
            call.cancel();
            return { value: undefined as any, done: true };
          }
        };
      }
    };
  }

  streamMetrics(request: MetricsRequest): AsyncIterable<MetricUpdate> {
    const call = this.client.streamMetrics(request);
    
    return {
      [Symbol.asyncIterator](): AsyncIterator<MetricUpdate> {
        return {
          next: async (): Promise<IteratorResult<MetricUpdate>> => {
            return new Promise((resolve, reject) => {
              call.on('data', (update: MetricUpdate) => {
                resolve({ value: update, done: false });
              });

              call.on('end', () => {
                resolve({ value: undefined as any, done: true });
              });

              call.on('error', (error: any) => {
                reject(error);
              });
            });
          },
          return: async (): Promise<IteratorResult<MetricUpdate>> => {
            call.cancel();
            return { value: undefined as any, done: true };
          }
        };
      }
    };
  }

  streamHealth(request: HealthRequest): AsyncIterable<HealthUpdate> {
    const call = this.client.streamHealth(request);
    
    return {
      [Symbol.asyncIterator](): AsyncIterator<HealthUpdate> {
        return {
          next: async (): Promise<IteratorResult<HealthUpdate>> => {
            return new Promise((resolve, reject) => {
              call.on('data', (update: HealthUpdate) => {
                resolve({ value: update, done: false });
              });

              call.on('end', () => {
                resolve({ value: undefined as any, done: true });
              });

              call.on('error', (error: any) => {
                reject(error);
              });
            });
          },
          return: async (): Promise<IteratorResult<HealthUpdate>> => {
            call.cancel();
            return { value: undefined as any, done: true };
          }
        };
      }
    };
  }

  close(): void {
    if (this.client) {
      this.client.close();
    }
  }
}
