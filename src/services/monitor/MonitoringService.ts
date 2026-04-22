import { EventEmitter } from 'events';

// 完全重写，不依赖 GrpcClient
export class MonitoringService extends EventEmitter {
  private metrics: any = {};

  constructor() {
    super();
  }

  public async start(): Promise<void> {
    console.log('📊 监控服务启动（无gRPC依赖）');
  }

  public async stop(): Promise<void> {
    console.log('📊 监控服务停止');
  }

  public recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    if (!this.metrics[name]) {
      this.metrics[name] = [];
    }
    this.metrics[name].push({ timestamp: Date.now(), value, tags });
  }

  public getMetrics(): any {
    return this.metrics;
  }
}
