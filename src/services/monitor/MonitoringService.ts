// 高级监控服务

import { MetricsCollector } from './MetricsCollector';
import { GrpcClient } from '../../protocols/grpc/GrpcClient';

export interface MonitoringServiceConfig {
  nodeId: string;
  grpcHost: string;
  grpcPort: number;
  metricsInterval?: number;
}

export class MonitoringService {
  private metricsCollector: MetricsCollector;
  private grpcClient: GrpcClient;
  private config: MonitoringServiceConfig;
  private isRunning: boolean = false;
  private metricsInterval?: NodeJS.Timeout;

  constructor(config: MonitoringServiceConfig) {
    this.config = config;
    this.metricsCollector = new MetricsCollector();
    
    this.grpcClient = new GrpcClient({
      host: config.grpcHost,
      port: config.grpcPort
    });

    // 配置默认警报
    this.configureDefaultAlerts();
  }

  // 启动服务
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('MonitoringService is already running');
      return;
    }

    try {
      // 测试gRPC连接
      const health = await this.grpcClient.healthCheck({});
      console.log('Monitoring gRPC connection established:', health.status);

      this.isRunning = true;
      
      // 开始指标收集
      this.startMetricsCollection();
      
      console.log(`MonitoringService started for node: ${this.config.nodeId}`);
      
    } catch (error) {
      console.error('Failed to start MonitoringService:', error);
      throw error;
    }
  }

  // 停止服务
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    await this.grpcClient.close();
    this.isRunning = false;
    
    console.log('MonitoringService stopped');
  }

  // 开始指标收集
  private startMetricsCollection(): void {
    const interval = this.config.metricsInterval || 5000;
    
    this.metricsInterval = setInterval(() => {
      this.collectSystemMetrics();
      this.reportMetrics();
    }, interval);

    console.log(`Metrics collection started (interval: ${interval}ms)`);
  }

  // 收集系统指标
  private collectSystemMetrics(): void {
    // 模拟系统指标收集
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    const cpuUsage = Math.random() * 100; // 模拟CPU使用率
    const networkLatency = Math.random() * 100; // 模拟网络延迟

    this.metricsCollector.recordMetric('memory_usage', memoryUsage, { unit: 'MB' });
    this.metricsCollector.recordMetric('cpu_usage', cpuUsage, { unit: '%' });
    this.metricsCollector.recordMetric('network_latency', networkLatency, { unit: 'ms' });

    // 模拟工具执行时间
    const toolExecutionTime = 50 + Math.random() * 150;
    this.metricsCollector.recordMetric('tool_execution_time', toolExecutionTime, { unit: 'ms' });

    // 模拟错误率
    if (Math.random() < 0.05) { // 5%错误率
      this.metricsCollector.recordMetric('tool_error', 1);
    }
  }

  // 报告指标到监控系统
  private reportMetrics(): void {
    const stats = this.metricsCollector.getPerformanceStats();
    
    console.log('📊 Performance Stats:', {
      avgToolTime: stats.toolExecutionTime.length 
        ? stats.toolExecutionTime.reduce((a, b) => a + b, 0) / stats.toolExecutionTime.length 
        : 0,
      avgMemory: stats.memoryUsage.length 
        ? stats.memoryUsage.reduce((a, b) => a + b, 0) / stats.memoryUsage.length 
        : 0,
      successRate: stats.successRate.toFixed(2) + '%'
    });

    // 这里可以通过gRPC将指标发送到中央监控系统
  }

  // 配置默认警报
  private configureDefaultAlerts(): void {
    // 工具执行时间警报
    this.metricsCollector.configureAlert('tool_execution_time', {
      threshold: 200, // 200ms
      severity: 'warning',
      message: 'Tool execution time too high',
      cooldown: 30000 // 30秒冷却
    });

    // 内存使用警报
    this.metricsCollector.configureAlert('memory_usage', {
      threshold: 500, // 500MB
      severity: 'error', 
      message: 'Memory usage too high',
      cooldown: 60000 // 1分钟冷却
    });

    // CPU使用率警报
    this.metricsCollector.configureAlert('cpu_usage', {
      threshold: 90, // 90%
      severity: 'warning',
      message: 'CPU usage too high',
      cooldown: 30000
    });

    // 错误率警报
    this.metricsCollector.configureAlert('tool_error', {
      threshold: 0.1, // 10%错误率
      severity: 'error',
      message: 'Tool error rate too high',
      cooldown: 60000
    });
  }

  // 获取服务状态
  getServiceStatus(): any {
    const stats = this.metricsCollector.getPerformanceStats();
    
    return {
      isRunning: this.isRunning,
      nodeId: this.config.nodeId,
      metricsCollected: this.metricsCollector.exportMetrics().length,
      performance: {
        avgToolTime: stats.toolExecutionTime.length 
          ? stats.toolExecutionTime.reduce((a, b) => a + b, 0) / stats.toolExecutionTime.length 
          : 0,
        avgMemory: stats.memoryUsage.length 
          ? stats.memoryUsage.reduce((a, b) => a + b, 0) / stats.memoryUsage.length 
          : 0,
        successRate: stats.successRate
      },
      grpcConnected: !!this.grpcClient
    };
  }

  // 手动记录指标
  recordMetric(name: string, value: number, tags?: Record<string, string>, unit?: string): void {
    this.metricsCollector.recordMetric(name, value, tags, unit);
  }

  // 获取性能统计
  getPerformanceStats(): any {
    return this.metricsCollector.getPerformanceStats();
  }

  // 获取指标统计
  getMetricStats(metricName: string): any {
    return this.metricsCollector.getMetricStats(metricName);
  }
}
