import { BasicMetricsCollector } from '../src/monitoring/BasicMetricsCollector';

describe('BasicMetricsCollector', () => {
  let collector: BasicMetricsCollector;

  beforeEach(() => {
    collector = new BasicMetricsCollector();
  });

  test('should be created successfully', () => {
    expect(collector).toBeInstanceOf(BasicMetricsCollector);
  });

  test('should record metrics without tags', () => {
    collector.recordMetric('test_metric', 100);
    collector.recordMetric('test_metric', 200);

    const metrics = collector.collectMetrics();
    
    expect(metrics).toHaveProperty('test_metric');
    expect(metrics.test_metric.count).toBe(2);
    expect(metrics.test_metric.sum).toBe(300);
    expect(metrics.test_metric.avg).toBe(150);
    expect(metrics.test_metric.min).toBe(100);
    expect(metrics.test_metric.max).toBe(200);
  });

  test('should handle empty metrics', () => {
    const metrics = collector.collectMetrics();
    expect(metrics).toEqual({});
  });

  test('should clear metrics', () => {
    collector.recordMetric('test_metric', 100);
    collector.clearMetrics();
    
    const metrics = collector.collectMetrics();
    expect(metrics).toEqual({});
  });

  test('should handle zero values', () => {
    collector.recordMetric('zero_metric', 0);
    collector.recordMetric('zero_metric', 0);

    const metrics = collector.collectMetrics();
    expect(metrics.zero_metric.count).toBe(2);
    expect(metrics.zero_metric.sum).toBe(0);
    expect(metrics.zero_metric.avg).toBe(0);
    expect(metrics.zero_metric.min).toBe(0);
    expect(metrics.zero_metric.max).toBe(0);
  });
});
