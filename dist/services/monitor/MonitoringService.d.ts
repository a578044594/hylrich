export interface MonitoringServiceConfig {
    nodeId: string;
    grpcHost: string;
    grpcPort: number;
    metricsInterval?: number;
}
export declare class MonitoringService {
    private metricsCollector;
    private grpcClient;
    private config;
    private isRunning;
    private metricsInterval?;
    constructor(config: MonitoringServiceConfig);
    start(): Promise<void>;
    stop(): Promise<void>;
    private startMetricsCollection;
    private collectSystemMetrics;
    private reportMetrics;
    private configureDefaultAlerts;
    getServiceStatus(): any;
    recordMetric(name: string, value: number, tags?: Record<string, string>, unit?: string): void;
    getPerformanceStats(): any;
    getMetricStats(metricName: string): any;
}
