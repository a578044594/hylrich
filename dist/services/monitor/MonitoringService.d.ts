import { EventEmitter } from 'events';
export declare class MonitoringService extends EventEmitter {
    private metrics;
    constructor();
    start(): Promise<void>;
    stop(): Promise<void>;
    recordMetric(name: string, value: number, tags?: Record<string, string>): void;
    getMetrics(): any;
}
