export interface Metric {
    name: string;
    value: number;
    timestamp: number;
    tags?: Record<string, any>;
}
export interface PerformanceStats {
    totalExecutions: number;
    errorCount: number;
    errorRate: number;
    successRate: number;
    toolExecutionTime: number[];
}
export declare class MetricsCollector {
    private metrics;
    private executionCount;
    private errorCount;
    private alertManager;
    constructor();
    recordMetric(name: string, value: number, tags?: Record<string, any>, unit?: string): void;
    recordError(): void;
    recordSuccess(): void;
    configureAlert(metricName: string, type: 'warning' | 'critical', threshold: number, cooldown?: number): void;
    getPerformanceStats(): PerformanceStats;
    exportMetrics(): Metric[];
    clearOldData(maxAge: number): void;
    reset(): void;
}
