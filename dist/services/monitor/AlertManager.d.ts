export interface AlertConfig {
    name: string;
    threshold: number;
    condition: 'above' | 'below' | 'equal';
    duration?: number;
    cooldown?: number;
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
export declare class AlertManager {
    private alerts;
    private alertHandlers;
    constructor();
    addAlert(config: AlertConfig): string;
    removeAlert(alertId: string): boolean;
    processMetric(metric: MetricData): Alert[];
    private checkCondition;
    onAlert(alertId: string, handler: (alert: Alert, metric: MetricData) => void): void;
    private triggerAlertHandlers;
    getAlerts(): Alert[];
    getTriggeredAlerts(): Alert[];
    resetAlert(alertId: string): boolean;
    clearAllAlerts(): void;
    getAlertStats(): {
        total: number;
        triggered: number;
        totalTriggers: number;
    };
}
