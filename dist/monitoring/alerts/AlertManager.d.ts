import { EventEmitter } from '../../core/EventEmitter';
export interface AlertConfig {
    metricName: string;
    threshold: number;
    type: 'warning' | 'critical';
    cooldown?: number;
}
export declare class AlertManager extends EventEmitter {
    private alerts;
    private lastAlertTime;
    configureAlert(alertId: string, config: AlertConfig): void;
    checkAlert(metricName: string, value: number): void;
    removeAlert(alertId: string): void;
    getAlerts(): AlertConfig[];
}
