import { EventEmitter } from 'events';
export interface MetricData {
    name: string;
    value: number;
    unit?: string;
    timestamp: number;
    tags?: Record<string, any>;
}
export interface MetricStats {
    count: number;
    sum: number;
    average: number;
    min: number;
    max: number;
    last: number;
}
export interface PerformanceStats {
    toolExecutionTime: MetricStats[];
    errorRate: number;
    successRate: number;
    totalExecutions: number;
    errorExecutions: number;
}
export declare class MetricsCollector extends EventEmitter {
    private metrics;
    private performanceStats;
    constructor();
    start(): void;
    stop(): void;
    recordMetric(name: string, value: number, tags?: Record<string, any>, unit?: string): void;
    private updatePerformanceStats;
    getMetricStats(name: string): MetricStats;
    getPerformanceStats(): PerformanceStats;
    configureAlert(metricName: string, config: {
        threshold: number;
        severity: 'info' | 'warning' | 'critical';
        message: string;
        cooldown: number;
    }): void;
    recordError(): void;
    clearOldData(ageInMs: number): void;
    reset(): void;
    exportMetrics(): MetricData[];
}
