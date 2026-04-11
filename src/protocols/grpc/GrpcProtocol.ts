import { EventEmitter } from '../../core/EventEmitter';

export interface GrpcConfig {
  port: number;
}

export class GrpcProtocol extends EventEmitter {
  private config: GrpcConfig;
  private isRunning = false;

  constructor(config: GrpcConfig) {
    super();
    this.config = config;
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('GrpcProtocol is already running');
    }

    this.isRunning = true;
    
    // 模拟gRPC服务器启动
    console.log(`gRPC server starting on port ${this.config.port}`);
    
    // 实际实现需要grpc库
    this.emit('started');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    console.log('gRPC server stopped');
    this.emit('stopped');
  }

  isRunning(): boolean {
    return this.isRunning;
  }
}
