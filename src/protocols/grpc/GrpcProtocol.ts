import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

export interface GrpcServerConfig {
  host: string;
  port: number;
  credentials?: grpc.ServerCredentials;
}

export class GrpcProtocol {
  private server: grpc.Server;
  private config: GrpcServerConfig;

  constructor(config: GrpcServerConfig) {
    this.config = config;
    this.server = new grpc.Server();
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.bindAsync(
        `${this.config.host}:${this.config.port}`,
        this.config.credentials || grpc.ServerCredentials.createInsecure(),
        (error, port) => {
          if (error) {
            reject(error);
          } else {
            console.log(`gRPC server started on port ${port}`);
            resolve();
          }
        }
      );
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.tryShutdown((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  addService(service: grpc.ServiceDefinition, implementation: grpc.UntypedServiceImplementation): void {
    this.server.addService(service, implementation);
  }
}
