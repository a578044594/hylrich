export abstract class MetricsCollector {
  abstract collectMetrics(): any;
  
  // 新增抽象方法以匹配测试期望
  abstract recordMetric(name: string, value: number, tags?: Record<string, string>): void;
  abstract recordError(error?: any): void;
  abstract exportMetrics(): any[];
  abstract reset(): void;
  abstract getPerformanceStats(): any;
  abstract clearOldData(ttlMs: number): void;
}
