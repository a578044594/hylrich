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
    
    const stats = metricsCollector.getMetricStats('test_metric');
    expect(stats.count).toBe(1);
    expect(stats.average).toBe(42);
    expect(stats.min).toBe(42);
    expect(stats.max).toBe(42);
  });

  test('should calculate performance statistics', () => {
    // 记录一些工具执行时间
    metricsCollector.recordMetric('tool_execution_time', 50);
    metricsCollector.recordMetric('tool_execution_time', 100);
    metricsCollector.recordMetric('tool_execution_time', 150);
    
    const stats = metricsCollector.getPerformanceStats();
    expect(stats.toolExecutionTime).toHaveLength(3);
  });

  test('should handle error rate calculation', () => {
    // 记录一些错误
    metricsCollector.recordError();
    metricsCollector.recordError();
    
    const stats = metricsCollector.getPerformanceStats();
    expect(stats.errorRate).toBeGreaterThan(0);
    expect(stats.successRate).toBeLessThan(100);
  });

  test('should configure and trigger alerts', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    
    metricsCollector.configureAlert('test_metric', {
      threshold: 50,
      severity: 'warning',
      message: 'Test alert triggered',
      cooldown: 1000
    });
    
    // 触发警报
    metricsCollector.recordMetric('test_metric', 60);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('WARNING'),
      expect.stringContaining('Test alert triggered')
    );
    
    consoleSpy.mockRestore();
  });

  test('should respect alert cooldown', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    
    metricsCollector.configureAlert('test_metric', {
      threshold: 50,
      severity: 'warning',
      message: 'Test alert',
      cooldown: 1000
    });
    
    // 第一次触发
    metricsCollector.recordMetric('test_metric', 60);
    const firstCallCount = consoleSpy.mock.calls.length;
    
    // 立即再次触发（应该在冷却期）
    metricsCollector.recordMetric('test_metric', 70);
    expect(consoleSpy.mock.calls.length).toBe(firstCallCount);
    
    // 等待冷却期
    setTimeout(() => {
      metricsCollector.recordMetric('test_metric', 80);
      expect(consoleSpy.mock.calls.length).toBe(firstCallCount + 1);
    }, 1100);
    
    consoleSpy.mockRestore();
  });

  test('should export metrics', () => {
    metricsCollector.recordMetric('export_test', 123, { tag: 'value' });
    
    const exported = metricsCollector.exportMetrics();
    expect(exported).toHaveLength(1);
    expect(exported[0].name).toBe('export_test');
    expect(exported[0].value).toBe(123);
    expect(exported[0].tags?.tag).toBe('value');
  });

  test('should clear old data', () => {
    const timestamp1 = Date.now() - 2000; // 2秒前
    const timestamp2 = Date.now() - 1000; // 1秒前
    
    // 模拟旧数据
    metricsCollector['metrics'].set('old_metric', [
      { name: 'old_metric', value: 1, timestamp: timestamp1 },
      { name: 'new_metric', value: 2, timestamp: timestamp2 }
    ]);
    
    metricsCollector.clearOldData(1500); // 1.5秒前
    
    const exported = metricsCollector.exportMetrics();
    expect(exported).toHaveLength(0); // 所有数据都被认为是旧的
  });

  test('should reset correctly', () => {
    metricsCollector.recordMetric('test_reset', 42);
    metricsCollector.reset();
    
    const stats = metricsCollector.getPerformanceStats();
    expect(stats.errorRate).toBe(0);
    expect(stats.successRate).toBe(100);
    
    const exported = metricsCollector.exportMetrics();
    expect(exported).toHaveLength(0);
  });

  test('should handle multiple metric types', () => {
    metricsCollector.recordMetric('memory_usage', 256, { unit: 'MB' });
    metricsCollector.recordMetric('cpu_usage', 75.5, { unit: '%' });
    metricsCollector.recordMetric('network_latency', 23.7, { unit: 'ms' });
    
    const memoryStats = metricsCollector.getMetricStats('memory_usage');
    const cpuStats = metricsCollector.getMetricStats('cpu_usage');
    const latencyStats = metricsCollector.getMetricStats('network_latency');
    
    expect(memoryStats.count).toBe(1);
    expect(cpuStats.count).toBe(1);
    expect(latencyStats.count).toBe(1);
  });
});
