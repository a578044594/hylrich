// 告警管理器 - Phase 6 高级功能

export interface AlertConfig {
  name: string;
  threshold: number;
  condition: 'above' | 'below' | 'equal';
  duration?: number; // 持续时间（毫秒）
  cooldown?: number; // 冷却时间（毫秒）
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
}

export interface Alert {
  id: string;
  config: AlertConfig;
  triggered: boolean;
  triggerTime?: number;
  triggerCount: number;
  lastTriggerTime?: number;
}

export interface MetricData {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export class AlertManager {
  private alerts: Map<string, Alert> = new Map();
  private alertHandlers: Map<string, (alert: Alert, metric: MetricData) => void> = new Map();

  constructor() {
    console.log('AlertManager initialized');
  }

  // 添加告警配置
  addAlert(config: AlertConfig): string {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alert: Alert = {
      id: alertId,
      config: {
        ...config,
        duration: config.duration || 0,
        cooldown: config.cooldown || 60000 // 默认1分钟冷却
      },
      triggered: false,
      triggerCount: 0
    };

    this.alerts.set(alertId, alert);
    console.log(`Alert added: ${config.name} (${alertId})`);
    
    return alertId;
  }

  // 移除告警
  removeAlert(alertId: string): boolean {
    return this.alerts.delete(alertId);
  }

  // 处理指标数据
  processMetric(metric: MetricData): Alert[] {
    const triggeredAlerts: Alert[] = [];

    for (const [alertId, alert] of this.alerts) {
      // 检查冷却时间
      if (alert.lastTriggerTime && 
          Date.now() - alert.lastTriggerTime < alert.config.cooldown!) {
        continue;
      }

      // 检查告警条件
      const shouldTrigger = this.checkCondition(
        metric.value,
        alert.config.threshold,
        alert.config.condition
      );

      if (shouldTrigger) {
        // 更新告警状态
        alert.triggered = true;
        alert.triggerTime = Date.now();
        alert.triggerCount++;
        alert.lastTriggerTime = Date.now();

        triggeredAlerts.push({...alert});

        // 触发告警处理器
        this.triggerAlertHandlers(alert, metric);

        console.log(`ALERT TRIGGERED: ${alert.config.name} - ${alert.config.message}`);
        console.log(`Metric: ${metric.name}=${metric.value}, Threshold: ${alert.config.threshold}`);
      } else if (alert.triggered) {
        // 重置告警状态
        alert.triggered = false;
        console.log(`Alert resolved: ${alert.config.name}`);
      }
    }

    return triggeredAlerts;
  }

  // 检查告警条件
  private checkCondition(value: number, threshold: number, condition: string): boolean {
    switch (condition) {
      case 'above':
        return value > threshold;
      case 'below':
        return value < threshold;
      case 'equal':
        return value === threshold;
      default:
        return false;
    }
  }

  // 注册告警处理器
  onAlert(alertId: string, handler: (alert: Alert, metric: MetricData) => void): void {
    this.alertHandlers.set(alertId, handler);
  }

  // 触发告警处理器
  private triggerAlertHandlers(alert: Alert, metric: MetricData): void {
    const handler = this.alertHandlers.get(alert.id);
    if (handler) {
      try {
        handler(alert, metric);
      } catch (error) {
        console.error(`Error in alert handler for ${alert.config.name}:`, error);
      }
    }
  }

  // 获取所有告警
  getAlerts(): Alert[] {
    return Array.from(this.alerts.values());
  }

  // 获取触发的告警
  getTriggeredAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(alert => alert.triggered);
  }

  // 重置告警
  resetAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.triggered = false;
      alert.triggerCount = 0;
      return true;
    }
    return false;
  }

  // 清空所有告警
  clearAllAlerts(): void {
    this.alerts.clear();
    this.alertHandlers.clear();
    console.log('All alerts cleared');
  }

  // 获取告警统计
  getAlertStats(): {
    total: number;
    triggered: number;
    totalTriggers: number;
  } {
    const alerts = Array.from(this.alerts.values());
    return {
      total: alerts.length,
      triggered: alerts.filter(a => a.triggered).length,
      totalTriggers: alerts.reduce((sum, a) => sum + a.triggerCount, 0)
    };
  }
}
