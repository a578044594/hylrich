export interface Metric {
    name: string;
    value: number;
    timestamp: number;
    tags?: Record<string, string>;
    unit?: string;
}
export interface PerformanceMetrics {
    toolExecutionTime: number[];
    memoryUsage: number[];
    cpuUsage: number[];
    networkLatency: number[];
    errorRate: number;
    successRate: number;
}
export interface AlertConfig {
    threshold: number;
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    cooldown?: number;
}
export declare class MetricsCollector {
    private metrics;
    private performance;
    private alertConfigs;
    private lastAlertTime;
    constructor();
    recordMetric(name: string, value: number, tags?: Record<string, string>, unit?: string): void;
    private updatePerformanceMetrics;
    configureAlert(metricName: string, config: AlertConfig): void;
    private checkAlerts;
    private triggerAlert;
    getPerformanceStats(): PerformanceMetrics;
    getMetricStats(metricName: string): {
        count: number;
        average: number;
        min: number;
        max: number;
        recent: number[];
    };
    clearOldData(maxAge?: number): void;
    exportMetrics(): Metric[];
    reset(): void;
}
