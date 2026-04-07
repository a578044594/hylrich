// 告警管理器测试 - Phase 6 高级功能

import { AlertManager } from '../src/services/monitor/AlertManager';

describe('AlertManager - Phase 6 Advanced Features', () => {
  let alertManager: AlertManager;

  beforeEach(() => {
    alertManager = new AlertManager();
  });

  test('should add and remove alerts', () => {
    // 添加一个告警
    const alertId = alertManager.addAlert({
      name: 'CPU Load Alert',
      threshold: 80,
      condition: 'above',
      severity: 'warning',
      message: 'CPU load exceeded threshold'
    });

    // 检查是否添加成功
    expect(alertManager.getAlerts().length).toBe(1);

    // 移除告警
    const removed = alertManager.removeAlert(alertId);
    expect(removed).toBe(true);
    expect(alertManager.getAlerts().length).toBe(0);
  });

  test('should handle metric processing and alert triggering', async () => {
    // 添加一个告警
    const alertId = alertManager.addAlert({
      name: 'Memory Usage Alert',
      threshold: 80,
      condition: 'above',
      severity: 'error',
      message: 'Memory usage exceeded 80%',
      duration: 5000
    });

    // 模拟指标数据（低于阈值）
    const metric1: any = {
      name: 'memory_usage',
      value: 70,
      timestamp: Date.now()
    };
    const triggeredAlerts1 = alertManager.processMetric(metric1);
    expect(triggeredAlerts1.length).toBe(0);

    // 模拟指标数据（高于阈值）
    const metric2: any = {
      name: 'memory_usage',
      value: 85,
      timestamp: Date.now()
    };
    const triggeredAlerts2 = alertManager.processLertedAlerts2 = alertManager.processMetric(metric2);
    expect(triggeredAlerts2.length).toBe(1);

    // 检查告警状态
    const alert = alertManager.getTriggeredAlerts()[0];
    expect(alert.triggered).toBe(true);
    expect(alert.triggerCount).toBe(1);

    // 模拟冷却时间后再次处理
    await new Promise(resolve => setTimeout(resolve, 6000));
    
    const metric3: any = {
      name: 'memory_usage',
      value: 85,
      timestamp: Date.now()
    };
    const triggeredAlerts3 = alertManager.processMetric(metric3);
    expect(triggeredAlerts3.length).toBe(1);

    // 检查冷却时间后告警是否重置
    expect(alertManager.getTriggeredAlerts().length).toBe(1);
  });

  test('should handle different alert conditions', async () => {
    // 添加一个低于阈值的告警
    const alertId = alertManager.addAlert({
      name: 'Low Memory Alert',
      threshold: 20,
      condition: 'below',
      severity: 'info',
      message: 'Memory usage below threshold'
    });

    // 模拟指标数据（低于阈值）
    const metric1: any = {
      name: 'memory_usage',
      value: 15,
      timestamp: Date.now()
    };
    const triggeredAlerts1 = alertManager.processMetric(metric1);
    expect(triggeredAlerts1.length).toBe(1);

    // 模拟指标数据（高于阈值）
    const metric2: any = {
      name: 'memory_usage',
      value: 25,
      timestamp: Date.now()
    };
    const triggeredAlerts2 = alertManager.processMetric(metric2);
    expect(triggeredAlerts2.length).toBe(0);

    // 检查告警状态
    const alert = alertManager.getTriggeredAlerts()[0];
    expect(alert.triggered).toBe(true);
    expect(alert.triggerCount).toBe(1);
  });

  test('should handle equal condition', async () => {
    // 添加一个等于阈值的告警
    const alertId = alertManager.addAlert({
      name: 'Exact Memory Alert',
      threshold: 50,
      condition: 'equal',
      severity: 'warning',
      message: 'Memory usage exactly at threshold'
    });

    // 模拟指标数据（等于阈值）
    const metric1: any = {
      name: 'memory_usage',
      value: 50,
      timestamp: Date.now()
    };
    const triggeredAlerts1 = alertManager.processMetric(metric1);
    expect(triggeredAlerts1.length).toBe(1);

    // 模拟指标数据（不等于阈值）
    const metric2: any = {
      name: 'memory_usage',
      value: 45,
      timestamp: Date.now()
    };
    const triggeredAlerts2 = alertManager.processMetric(metric2);
    expect(triggeredAlerts2.length).toBe(0);
  });

  test('should handle alert handlers', async () => {
    // 添加一个告警并注册处理器
    const alertId = alertManager.addAlert({
      name: 'Custom Alert',
      threshold: 100,
      condition: 'above',
      severity: 'error',
      message: 'Custom alert triggered'
    });

    let handlerCalled = false;
    const handler = (alert: any, metric: any) => {
      handlerCalled = true;
      expect(alert.config.threshold).toBe(100);
      expect(metric.name).toBe('memory_usage');
    };

    alertManager.onAlert(alertId, handler);

    // 模拟指标数据（高于阈值）
    const metric: any = {
      name: 'memory_usage',
      value: 110,
      timestamp: Date.now()
    };
    alertManager.processMetric(metric);

    expect(handlerCalled).toBe(true);
  });

  test('should get alert statistics', async () => {
    // 添加几个告警
    alertManager.addAlert({
      name: 'Alert 1',
      threshold: 80,
      condition: 'above',
      severity: 'warning'
    });

    alertManager.addAlert({
      name: 'Alert 2',
      threshold: 90,
      condition: 'above',
      severity: 'error'
    });

    // 模拟触发一个告警
    const metric: any = {
      name: 'memory_usage',
      value: 95,
      timestamp: Date.now()
    };
    alertManager.processMetric(metric);

    const stats = alertManager.getAlertStats();
    expect(stats.total).toBe(2);
    expect(stats.triggered).toBe(1);
    expect(stats.totalTriggers).toBe(1);
  });
});
