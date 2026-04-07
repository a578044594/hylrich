// 指标收集器测试

import { BasicMetricsCollector } from '../../monitoring/BasicMetricsCollector';

describe('BasicMetricsCollector - Phase 6 Advanced Features', () => {
  let metricsCollector: BasicMetricsCollector;

  beforeEach(() => {
    metricsCollector = new BasicMetricsCollector();
  });

  test('should initialize correctly', () => {
    expect(metricsCollector).toBeDefined();
  });

  test('should record and retrieve metrics', () => {
    // 记录指标
    metricsCollector.recordMetric('test_metric', 100, {
      category: 'performance'
    });

    // 获取指标
    const metrics = metricsCollector.getMetrics('test_metric');
    expect(metrics.length).toBe(1);
    expect(metrics[0].name).toBe('test_metric');
    expect(metrics[0].value).toBe(100);
    expect(metrics[0].tags).toEqual({ category: 'performance' });

    // 记录另一个指标
    metricsCollector.recordMetric('test_metric_2', 200, {
      category: 'performance'
    });

    const allMetrics = metricsCollector.getMetrics('test_metric');
    expect(allMetrics.length).toBe(1); // 仍然只有一个指标，因为名称相同

    // 获取所有指标
    const allMetricsList = metricsCollector.getAllMetrics();
    expect(allMetricsList.length).toBe(2);
    expect(allMetricsList[0].name).toBe('test_metric');
    expect(allMetricsList[0].value).toBe(100);
    expect(allMetricsList[0].tags).toEqual({ category: 'performance' });
    expect(allMetricsList[1].name).toBe('test_metric_2');
    expect(allMetricsList[1].value).toBe(200);
    expect(allMetricsList[1].tags).toEqual({ category: 'performance' });

    // 获取按标签过滤的指标
    const filteredMetrics = metricsCollector.getMetricsByTag('category', 'performance');
    expect(filteredMetrics.length).toBe(2);

    // 获取指标统计
    const stats = metricsCollector.getMetricStats('test_metric');
    expect(stats.count).toBe(1);
    expect(stats.sum).toBe(100);
    expect(stats.average).toBe(100);
    expect(stats.min).toBe(100);
    expect(stats.max).toBe(100);

    // 清空指标
    metricsCollector.clearMetrics();
    const clearedMetrics = metricsCollector.getMetrics('test_metric');
    expect(clearedMetrics.length).toBe(0);
  });

  test('should handle metric updates', () => {
    // 记录初始指标
    metricsCollector.recordMetric('update_test', 50, {
      category: 'performance'
    });

    // 更新指标值
    metricsCollector.recordMetric('update_test', 75, {
      category: 'performance'
    });

    const metrics = metricsCollector.getMetrics('update_test');
    expect(metrics.length).toBe(1);
    expect(metrics[0].value).toBe(75);

    // 获取指标统计
    const stats = metricsCollector.getMetricStats('update_test');
    expect(stats.count).toBe(1);
    expect(stats.sum).toBe(75);
    expect(stats.average).toBe(75);
    expect(stats.min).toBe(75);
    expect(stats.max).toBe(75);
  });

  test('should handle metric deletion', () => {
    // 记录指标
    metricsCollector.recordMetric('delete_test', 100, {
      category: 'performance'
    });

    // 删除指标
    metricsCollector.deleteMetric('delete_test');

    const metrics = metricsCollector.getMetrics('delete_test');
    expect(metrics.length).toBe(0);

    // 获取所有指标
    const allMetrics = metricsCollector.getAllMetrics();
    expect(allMetrics.length).toBe(0);
  });

  test('should handle metric aggregation', () => {
    // 记录多个指标
    metricsCollector.recordMetric('agg_test_1', 10, { category: 'performance' });
    metricsCollector.recordMetric('agg_test_2', 20, { category: 'performance' });
    metricsCollector.recordMetric('agg_test_3', 30, { category: 'performance' });

    // 获取所有指标
    const allMetrics = metricsCollector.getAllMetrics();
    expect(allMetrics.length).toBe(3);

    // 获取按标签过滤的指标
    const filteredMetrics = metricsCollector.getMetricsByTag('category', 'performance');
    expect(filteredMetrics.length).toBe(3);

    // 计算统计信息
    const stats = metricsCollector.getMetricStats('agg_test_1');
    expect(stats.count).toBe(1);
    expect(stats.sum).toBe(10);
    expect(stats.average).toBe(10);
    expect(stats.min).toBe(10);
    expect(stats.max).toBe(10);

    // 计算所有指标的统计
    const allStats = metricsCollector.getMetricStats('all');
    expect(allStats.count).toBe(3);
    expect(allStats.sum).toBe(60);
    expect(allStats.average).toBe(20);
    expect(allStats.min).toBe(10);
    expect(allStats.max).toBe(30);
  });
});
