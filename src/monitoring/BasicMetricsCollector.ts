// 基础指标收集器

import { EventEmitter } from 'events';

export interface MetricData {
  name: string;
  value: number;
  unit?: string;
  timestamp: number;
  tags?: Record<string, any>;
}

export interface MetricStats {
  count: number;
  sum: number;
  average: number;
  min: number;
  max: number;
  last: number;
}

export class BasicMetricsCollector extends EventEmitter {
  private metrics: Map<string, MetricData[]> = new Map();

  constructor() {
    super();
    console.log('BasicMetricsCollector initialized');
  }

  recordMetric(
    name: string,
    value: number,
    tags?: Record<string, any>,
    unit?: string
  ): void {
    const metric: MetricData = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name)!.push(metric);

    // 触发指标更新事件
    this.emit('metric', metric);
  }

  getMetricStats(name: string): MetricStats {
    const metrics = this.metrics.get(name) || [];
    
    if (metrics.length === 0) {
      return {
        count: 0,
        sum: 0,
        average: 0,
        min: 0,
        max: 0,
        last: 0
      };
    }

    const stats: MetricStats = {
      count: metrics.length,
      sum: metrics.reduce((sum, m) => sum + m.value, 0),
      average: metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length,
      min: Math.min(...metrics.map(m => m.value)),
      max: Math.max(...metrics.map(m => m.value)),
      last: metrics[metrics.length - 1].value
    };

    return stats;
  }

  exportMetrics(): MetricData[] {
    const allMetrics: MetricData[] = [];
    
    for (const metrics of this.metrics.values()) {
      allMetrics.push(...metrics);
    }

    return allMetrics;
  }

  clearOldData(ageInMs: number): void {
    const cutoffTime = Date.now() - ageInMs;
    
    for (const [name, metrics] of this.metrics) {
      const filtered = metrics.filter(m => m.timestamp > cutoffTime);
      
      if (filtered.length === 0) {
        this.metrics.delete(name);
      } else {
        this.metrics.set(name, filtered);
      }
    }
  }

  reset(): void {
    this.metrics.clear();
    console.log('BasicMetricsCollector reset');
  }
}
