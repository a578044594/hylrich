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
export declare class BasicMetricsCollector extends EventEmitter {
    private metrics;
    constructor();
    recordMetric(name: string, value: number, tags?: Record<string, any>, unit?: string): void;
    getMetricStats(name: string): MetricStats;
    exportMetrics(): MetricData[];
    clearOldData(ageInMs: number): void;
    reset(): void;
}
