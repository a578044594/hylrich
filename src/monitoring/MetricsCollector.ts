import { AlertManager } from './alerts/AlertManager';

export interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, any>;
}

export interface PerformanceStats {
  totalExecutions: number;
  errorCount: number;
  errorRate: number;
  successRate: number;
  toolExecutionTime: number[];
}

export class MetricsCollector {
  private metrics: Metric[] = [];
  private executionCount = 0;
  private errorCount = 0;
  private alertManager: AlertManager;

  constructor() {
    this.alertManager = new AlertManager();
    console.log('MetricsCollector initialized');
  }

  recordMetric(name: string, value: number, tags?: Record<string, any>, unit?: string): void {
    const metric: Metric = {
      name,
      value,
      timestamp: Date.now(),
      tags: { ...tags, unit }
    };
    
    this.metrics.push(metric);
    
    // 检查警报
    this.alertManager.checkAlert(name, value);
  }

  recordError(): void {
    this.errorCount++;
    this.executionCount++;
  }

  recordSuccess(): void {
    this.executionCount++;
  }

  configureAlert(metricName: string, type: 'warning' | 'critical', threshold: number, cooldown?: number): void {
    this.alertManager.configureAlert(`${metricName}_${type}`, {
      metricName,
      threshold,
      type,
      cooldown
    });
  }

  getPerformanceStats(): PerformanceStats {
    const totalExecutions = this.executionCount;
    const errorRate = totalExecutions > 0 ? (this.errorCount / totalExecutions) * 100 : 0;
    const successRate = 100 - errorRate;
    
    return {
      totalExecutions,
      errorCount: this.errorCount,
      errorRate,
      successRate,
      toolExecutionTime: this.metrics
        .filter(m => m.name === 'tool_execution_time')
        .map(m => m.value)
    };
  }

  exportMetrics(): Metric[] {
    return [...this.metrics];
  }

  clearOldData(maxAge: number): void {
    const cutoffTime = Date.now() - maxAge;
    this.metrics = this.metrics.filter(m => m.timestamp >= cutoffTime);
  }

  reset(): void {
    this.metrics = [];
    this.executionCount = 0;
    this.errorCount = 0;
  }
}
