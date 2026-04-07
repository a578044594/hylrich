"use strict";
// 高级监控系统 - 指标收集器
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsCollector = void 0;
class MetricsCollector {
    constructor() {
        this.metrics = [];
        this.performance = {
            toolExecutionTime: [],
            memoryUsage: [],
            cpuUsage: [],
            networkLatency: [],
            errorRate: 0,
            successRate: 100
        };
        this.alertConfigs = new Map();
        this.lastAlertTime = new Map();
        console.log('MetricsCollector initialized');
    }
    // 记录指标
    recordMetric(name, value, tags, unit) {
        const metric = {
            name,
            value,
            timestamp: Date.now(),
            tags,
            unit
        };
        this.metrics.push(metric);
        // 更新性能指标
        this.updatePerformanceMetrics(name, value);
        // 检查警报
        this.checkAlerts(name, value);
    }
    // 更新性能指标
    updatePerformanceMetrics(name, value) {
        switch (name) {
            case 'tool_execution_time':
                this.performance.toolExecutionTime.push(value);
                if (this.performance.toolExecutionTime.length > 100) {
                    this.performance.toolExecutionTime.shift();
                }
                break;
            case 'memory_usage':
                this.performance.memoryUsage.push(value);
                if (this.performance.memoryUsage.length > 100) {
                    this.performance.memoryUsage.shift();
                }
                break;
            case 'cpu_usage':
                this.performance.cpuUsage.push(value);
                if (this.performance.cpuUsage.length > 100) {
                    this.performance.cpuUsage.shift();
                }
                break;
            case 'network_latency':
                this.performance.networkLatency.push(value);
                if (this.performance.networkLatency.length > 100) {
                    this.performance.networkLatency.shift();
                }
                break;
            case 'tool_error':
                this.performance.errorRate = (this.performance.errorRate * 0.9) + (value * 0.1);
                this.performance.successRate = 100 - this.performance.errorRate;
                break;
        }
    }
    // 配置警报
    configureAlert(metricName, config) {
        this.alertConfigs.set(metricName, config);
        console.log(`Alert configured for ${metricName}: ${config.severity} > ${config.threshold}`);
    }
    // 检查警报
    checkAlerts(metricName, value) {
        const config = this.alertConfigs.get(metricName);
        if (!config)
            return;
        const now = Date.now();
        const lastAlert = this.lastAlertTime.get(metricName) || 0;
        const cooldown = config.cooldown || 60000; // 默认1分钟冷却
        if (value > config.threshold && now - lastAlert > cooldown) {
            this.triggerAlert(metricName, value, config);
            this.lastAlertTime.set(metricName, now);
        }
    }
    // 触发警报
    triggerAlert(metricName, value, config) {
        const alertMessage = `${config.message} | Current: ${value}, Threshold: ${config.threshold}`;
        console.log(`🚨 [${config.severity.toUpperCase()}] ${alertMessage}`);
        // 这里可以集成到实际的警报系统（邮件、短信、Slack等）
        this.recordMetric('alert_triggered', 1, {
            metric: metricName,
            severity: config.severity,
            value: value.toString(),
            threshold: config.threshold.toString()
        });
    }
    // 获取性能统计
    getPerformanceStats() {
        return {
            ...this.performance,
            toolExecutionTime: this.performance.toolExecutionTime.slice(-50), // 返回最近50个数据点
            memoryUsage: this.performance.memoryUsage.slice(-50),
            cpuUsage: this.performance.cpuUsage.slice(-50),
            networkLatency: this.performance.networkLatency.slice(-50)
        };
    }
    // 获取指标统计
    getMetricStats(metricName) {
        const metrics = this.metrics.filter(m => m.name === metricName);
        const values = metrics.map(m => m.value);
        const recent = values.slice(-20);
        return {
            count: metrics.length,
            average: values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0,
            min: values.length ? Math.min(...values) : 0,
            max: values.length ? Math.max(...values) : 0,
            recent
        };
    }
    // 清除旧数据
    clearOldData(maxAge = 24 * 60 * 60 * 1000) {
        const cutoff = Date.now() - maxAge;
        this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
        console.log(`Cleared metrics older than ${maxAge}ms`);
    }
    // 导出所有指标
    exportMetrics() {
        return [...this.metrics];
    }
    // 重置收集器
    reset() {
        this.metrics = [];
        this.performance = {
            toolExecutionTime: [],
            memoryUsage: [],
            cpuUsage: [],
            networkLatency: [],
            errorRate: 0,
            successRate: 100
        };
        console.log('MetricsCollector reset');
    }
}
exports.MetricsCollector = MetricsCollector;
//# sourceMappingURL=MetricsCollector.js.map