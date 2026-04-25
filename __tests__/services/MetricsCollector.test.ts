import { BasicMetricsCollector } from '../../src/monitoring/BasicMetricsCollector';

describe('MetricsCollector', () => {
  let metricsCollector: BasicMetricsCollector;

  beforeEach(() => {
    metricsCollector = new BasicMetricsCollector();
  });

  test('should initialize correctly', () => {
    const stats = metricsCollector.getPerformanceStats();
    expect(stats.errorCount).toBe(0);
    expect(stats.metricCount).toBe(0);
    expect(stats.uptime).toBeGreaterThan(0);
  });

  test('should record metrics with tags', () => {
    metricsCollector.recordMetric('test_metric', 42, { unit: 'count' });
    const metrics = metricsCollector.exportMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].name).toBe('test_metric');
    expect(metrics[0].value).toBe(42);
    expect(metrics[0].tags).toEqual({ unit: 'count' });
  });

  test('should calculate performance statistics', () => {
    metricsCollector.recordMetric('tool_execution_time', 100);
    metricsCollector.recordMetric('tool_execution_time', 200);
    metricsCollector.recordMetric('tool_execution_time', 150);
    
    const stats = metricsCollector.getPerformanceStats();
    expect(stats.metricCount).toBe(3);
  });

  test('should handle error rate calculation', () => {
    metricsCollector.recordError();
    
    const stats = metricsCollector.getPerformanceStats();
    expect(stats.errorCount).toBe(1);
  });

  test('should export metrics', () => {
    metricsCollector.recordMetric('metric1', 10);
    metricsCollector.recordMetric('metric2', 20);
    
    const exported = metricsCollector.exportMetrics();
    expect(exported).toHaveLength(2);
  });

  test('should clear old data', () => {
    const now = Date.now();
    // Add a recent metric
    metricsCollector.recordMetric('new_metric', 2);
    // Add an old metric directly via internal array for test purposes
    const anyCollector = metricsCollector as any;
    anyCollector.metrics.push({
      name: 'old_metric',
      value: 99,
      timestamp: now - 3600000 // 1 hour ago
    });
    
    metricsCollector.clearOldData(1800000); // 30 minutes TTL
    
    const exported = metricsCollector.exportMetrics();
    expect(exported).toHaveLength(1);
    expect(exported[0].name).toBe('new_metric');
  });

  test('should reset correctly', () => {
    metricsCollector.recordMetric('test_metric', 10);
    metricsCollector.recordError();
    
    metricsCollector.reset();
    
    const stats = metricsCollector.getPerformanceStats();
    expect(stats.errorCount).toBe(0);
    expect(stats.metricCount).toBe(0);
    expect(metricsCollector.exportMetrics()).toHaveLength(0);
  });
});
