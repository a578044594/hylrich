import { AlertManager } from '../../src/monitoring/alerts/AlertManager';

describe('AlertManager', () => {
  let alertManager: AlertManager;

  beforeEach(() => {
    alertManager = new AlertManager();
  });

  it('should add and check alerts', () => {
    const rule = {
      metricName: 'cpu_usage',
      threshold: 80,
      severity: 'error',
      message: 'CPU usage too high',
      condition: 'gt'
    };
    alertManager.addRule(rule);

    const metrics = { cpu_usage: 85 };
    alertManager.checkAlerts(metrics);

    expect(alertManager.getAlerts().length).toBe(1);
  });
});
