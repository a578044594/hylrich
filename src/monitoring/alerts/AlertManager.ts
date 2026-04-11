import { EventEmitter } from '../../core/EventEmitter';

export interface AlertConfig {
  metricName: string;
  threshold: number;
  type: 'warning' | 'critical';
  cooldown?: number;
}

export class AlertManager extends EventEmitter {
  private alerts: Map<string, AlertConfig> = new Map();
  private lastAlertTime: Map<string, number> = new Map();

  configureAlert(alertId: string, config: AlertConfig): void {
    this.alerts.set(alertId, config);
    console.log(`Alert configured for ${config.metricName}: ${config.type} > ${config.threshold}`);
  }

  checkAlert(metricName: string, value: number): void {
    for (const [alertId, config] of this.alerts.entries()) {
      if (config.metricName === metricName && value > config.threshold) {
        const now = Date.now();
        const lastTime = this.lastAlertTime.get(alertId) || 0;
        
        // 检查冷却时间
        if (!config.cooldown || now - lastTime > config.cooldown) {
          this.lastAlertTime.set(alertId, now);
          
          const alertMessage = `${config.type.toUpperCase()}: ${metricName} value ${value} exceeds threshold ${config.threshold}`;
          
          this.emit('alert', {
            alertId,
            metricName,
            value,
            threshold: config.threshold,
            type: config.type,
            message: alertMessage
          });
          
          console.log(alertMessage);
        }
      }
    }
  }

  removeAlert(alertId: string): void {
    this.alerts.delete(alertId);
    this.lastAlertTime.delete(alertId);
  }

  getAlerts(): AlertConfig[] {
    return Array.from(this.alerts.values());
  }
}
