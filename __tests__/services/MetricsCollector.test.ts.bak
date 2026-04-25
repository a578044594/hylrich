// 指标收集器单元测试

import { MetricsCollector } from '../../src/monitoring/MetricsCollector';

describe('MetricsCollector', () => {
  let metricsCollector: MetricsCollector;

  beforeEach(() => {
    metricsCollector = new MetricsCollector();
  });

  test('should initialize correctly', () => {
    const stats = metricsCollector.getPerformanceStats();
    expect(stats.errorRate).toBe(0);
    expect(stats.successRate).toBe(100);
  });

  test('should record metrics with tags', () => {
    metricsCollector.recordMetric('test_metric', 42, { unit: 'count' }, 'items');
    const metrics = metricsCollector.exportMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].name).toBe('test_metric');
    expect(metrics[0].value).toBe(42);
  });

  test('should calculate performance statistics', () => {
    metricsCollector.recordMetric('tool_execution_time', 100);
    metricsCollector.recordMetric('tool_execution_time', 200);
    metricsCollector.recordMetric('tool_execution_time', 150);
    
    const stats = metricsCollector.getPerformanceStats();
    expect(stats.toolExecutionTime).toHaveLength(3);
  });

  test('should handle error rate calculation', () => {
    metricsCollector.recordError();
    
    const stats = metricsCollector.getPerformanceStats();
    expect(stats.errorRate).toBeGreaterThan(0);
    expect(stats.successRate).toBeLessThan(100);
  });

  test('should configure and trigger alerts', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    
    metricsCollector.configureAlert('test_metric', 'warning', 50);
    metricsCollector.recordMetric('test_metric', 60);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('WARNING'),
      expect.stringContaining('Test alert triggered')
    );
  });

  test('should respect alert cooldown', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    
    metricsCollector.configureAlert('test_metric', 'warning', 50, 1000);
    metricsCollector.recordMetric('test_metric', 60);
    metricsCollector.recordMetric('test_metric', 70); // 应该被冷却
    
    expect(consoleSpy).toHaveBeenCalledTimes(1);
  });

  test('should export metrics', () => {
    metricsCollector.recordMetric('metric1', 10);
    metricsCollector.recordMetric('metric2', 20);
    
    const exported = metricsCollector.exportMetrics();
    expect(exported).toHaveLength(2);
  });

  test('should clear old data', () => {
    metricsCollector.recordMetric('new_metric', 2);
    
    // 模拟时间流逝
    const currentTime = Date.now();
    metricsCollector['metrics'] = metricsCollector['metrics'].map(metric => ({
      ...metric,
      timestamp: currentTime - 3600000 // 1小时前
    }));
    
    metricsCollector.clearOldData(1800000); // 清除30分钟前的数据
    
    const exported = metricsCollector.exportMetrics();
    expect(exported).toHaveLength(0); // 所有数据都被认为是旧的
  });

  test('should reset correctly', () => {
    metricsCollector.recordMetric('test_metric', 10);
    metricsCollector.recordError();
    
    metricsCollector.reset();
    
    const stats = metricsCollector.getPerformanceStats();
    expect(stats.errorRate).toBe(0);
    expect(stats.successRate).toBe(100);
    expect(metricsCollector.exportMetrics()).toHaveLength(0);
  });
});
