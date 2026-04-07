import { MetricsCollector } from "./MetricsCollector";

export class BasicMetricsCollector extends MetricsCollector {
  private metrics: Map<string, number[]> = new Map();
  
  collectMetrics(): any {
    const result: any = {};
    
    for (const [metricName, values] of this.metrics.entries()) {
      if (values.length > 0) {
        result[metricName] = {
          count: values.length,
          sum: values.reduce((a, b) => a + b, 0),
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values)
        };
      }
    }
    
    return result;
  }
  
  getMetrics(metricName?: string): any {
    if (metricName) {
      // 返回特定指标的统计
      const result: any = {};
      
      for (const [key, values] of this.metrics.entries()) {
        if (key.startsWith(metricName)) {
          if (values.length > 0) {
            result[key] = {
              count: values.length,
              sum: values.reduce((a, b) => a + b, 0),
              avg: values.reduce((a, b) => a + b, 0) / values.length,
              min: Math.min(...values),
              max: Math.max(...values)
            };
          }
        }
      }
      
      return result;
    }
    
    // 返回所有指标
    return this.collectMetrics();
  }
  
  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    const metricKey = tags ? `${name}_${JSON.stringify(tags)}` : name;
    
    if (!this.metrics.has(metricKey)) {
      this.metrics.set(metricKey, []);
    }
    
    this.metrics.get(metricKey)!.push(value);
  }
  
  clearMetrics(): void {
    this.metrics.clear();
  }
}
