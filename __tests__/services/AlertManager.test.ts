// 警告管理器单元测试

import { AlertManager, AlertLevel, Alert } from '../../src/services/monitor/AlertManager';

describe('AlertManager', () => {
  let alertManager: AlertManager;

  beforeEach(() => {
    alertManager = new AlertManager();
  });

  test('should create alerts with correct level', () => {
    const criticalAlert = alertManager.createAlert('critical', 'Test critical', {
      metric: 'test_metric',
      value: 100
    });
    
    expect(criticalAlert.level).toBe(AlertLevel.CRITICAL);
    expect(criticalAlert.message).toBe('Test critical');
  });

  test('should handle different alert levels', () => {
    const criticalAlert = alertManager.createAlert('critical', 'Critical error');
    const warningAlert = alertManager.createAlert('warning', 'Warning message');
    const infoAlert = alertManager.createAlert('info', 'Info message');
    
    expect(criticalAlert.level).toBe(AlertLevel.CRITICAL);
    expect(warningAlert.level).toBe(AlertLevel.WARNING);
    expect(infoAlert.level).toBe(AlertLevel.INFO);
  });

  test('should generate unique alert IDs', () => {
    const alert1 = alertManager.createAlert('info', 'Alert 1');
    const alert2 = alertManager.createAlert('info', 'Alert 2');
    
    expect(alert1.id).not.toBe(alert2.id);
    expect(alert1.id).toMatch(/^alert-\d+$/);
  });

  test('should track alert history', () => {
    alertManager.createAlert('warning', 'First warning');
    alertManager.createAlert('info', 'Info message');
    alertManager.createAlert('critical', 'Critical error');
    
    const history = alertManager.getAlertHistory();
    expect(history).toHaveLength(3);
  });

  test('should filter alerts by level', () => {
    alertManager.createAlert('info', 'Info 1');
    alertManager.createAlert('warning', 'Warning 1');
    alertManager.createAlert('critical', 'Critical 1');
    
    const criticalAlerts = alertManager.getAlertsByLevel('critical');
    expect(criticalAlerts).toHaveLength(1);
    expect(criticalAlerts[0].level).toBe(AlertLevel.CRITICAL);
  });

  test('should filter alerts by time range', () => {
    const alert1 = alertManager.createAlert('info', 'Alert 1');
    const alert2 = alertManager.createAlert('info', 'Alert 2');
    
    const history = alertManager.getAlertsByTimeRange(
      new Date(alert1.timestamp),
      new Date(alert2.timestamp)
    );
    
    expect(history).toHaveLength(2);
  });

  test('should clear old alerts', () => {
    alertManager.createAlert('info', 'Old alert');
    alertManager.createAlert('info', 'Recent alert');
    
    alertManager.clearOldAlerts(Date.now() - 10000); // 10秒前
    
    const history = alertManager.getAlertHistory();
    expect(history).toHaveLength(1);
    expect(history[0].message).toBe('Recent alert');
  });

  test('should provide summary statistics', () => {
    alertManager.createAlert('info', 'Info 1');
    alertManager.createAlert('warning', 'Warning 1');
    alertManager.createAlert('critical', 'Critical 1');
    
    const stats = alertManager.getStats();
    expect(stats.total).toBe(3);
    expect(stats.byLevel.info).toBe(1);
    expect(stats.byLevel.warning).toBe(1);
    expect(stats.byLevel.critical).toBe(1);
  });

  test('should handle duplicate alerts with cooldown', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    
    alertManager.configureAlert('test_metric', {
      threshold: 50,
      severity: 'warning',
      message: 'Metric exceeded threshold',
      cooldown: 1000
    });
    
    // 第一次触发
    alertManager.recordMetric('test_metric', 60);
    const firstCallCount = consoleSpy.mock.calls.length;
    
    // 立即再次触发（应该在冷却期）
    alertManager.recordMetric('test_metric', 70);
    expect(consoleSpy.mock.calls.length).toBe(firstCallCount);
    
    // 等待冷却期
    setTimeout(() => {
      alertManager.recordMetric('test_metric', 80);
      expect(consoleSpy.mock.calls.length).toBe(firstCallCount + 1);
    }, 1100);
    
    consoleSpy.mockRestore();
  });

  test('should export alerts for reporting', () => {
    alertManager.createAlert('critical', 'Critical error');
    alertManager.createAlert('warning', 'Warning message');
    
    const exported = alertManager.exportAlerts();
    expect(exported).toHaveLength(2);
    expect(exported[0].level).toBe(AlertLevel.CRITICAL);
    expect(exported[1].level).toBe(AlertLevel.WARNING);
  });
});
