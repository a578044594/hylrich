import { MetricsCollector } from "./MetricsCollector";

interface MetricEntry {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp: number;
}

export class BasicMetricsCollector extends MetricsCollector {
  private metrics: MetricEntry[] = [];
  private errors: Error[] = [];
  private startTime: number = Date.now();
  
  collectMetrics(): any {
    const aggregated: Record<string, number[]> = {};
    
    for (const metric of this.metrics) {
      const key = metric.name;
      if (!aggregated[key]) aggregated[key] = [];
      aggregated[key].push(metric.value);
    }
    
    const result: any = {};
    for (const [name, values] of Object.entries(aggregated)) {
      result[name] = {
        count: values.length,
        sum: values.reduce((a,b)=>a+b,0),
        avg: values.reduce((a,b)=>a+b,0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values)
      };
    }
    
    return result;
  }
  
  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    this.metrics.push({ name, value, tags, timestamp: Date.now() });
  }
  
  recordError(error?: any): void {
    if (error instanceof Error) {
      this.errors.push(error);
    } else {
      this.errors.push(new Error(String(error)));
    }
  }
  
  exportMetrics(): any[] {
    return this.metrics.map(m => ({
      name: m.name,
      value: m.value,
      tags: m.tags,
      timestamp: m.timestamp
    }));
  }
  
  reset(): void {
    this.metrics = [];
    this.errors = [];
    this.startTime = Date.now();
  }
  
  getPerformanceStats(): any {
    return {
      metricCount: this.metrics.length,
      errorCount: this.errors.length,
      uptime: process.uptime()
    };
  }
  
  clearOldData(ttlMs: number): void {
    const cutoff = Date.now() - ttlMs;
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
  }
  
  clearMetrics(): void {
    this.metrics = [];
  }
}
