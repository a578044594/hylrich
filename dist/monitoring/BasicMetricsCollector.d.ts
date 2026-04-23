import { MetricsCollector } from "./MetricsCollector";
export declare class BasicMetricsCollector extends MetricsCollector {
    private metrics;
    collectMetrics(): any;
    recordMetric(name: string, value: number, tags?: Record<string, string>): void;
    clearMetrics(): void;
}
