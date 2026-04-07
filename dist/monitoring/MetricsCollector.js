"use strict";
// 指标收集器
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsCollector = void 0;
const events_1 = require("events");
class MetricsCollector extends events_1.EventEmitter {
    constructor() {
        super();
        this.metrics = new Map();
        this.performanceStats = {
            toolExecutionTime: [],
            errorRate: 0,
            successRate: 100,
            totalExecutions: 0,
            errorExecutions: 0
        };
        console.log('MetricsCollector initialized');
        this.start();
    }
    start() {
        // 启动定时清理任务
        setInterval(() => {
            this.clearOldData(3600000); // 每小时清理一次
        }, 3600000);
    }
    stop() {
        // 清理定时器
        this.removeAllListeners();
    }
    recordMetric(name, value, tags, unit) {
        const metric = {
            name,
            value,
            unit,
            timestamp: Date.now(),
            tags
        };
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        this.metrics.get(name).push(metric);
        // 更新性能统计
        this.updatePerformanceStats(name, value);
        // 触发指标更新事件
        this.emit('metric', metric);
    }
    updatePerformanceStats(name, value) {
        if (name === 'tool_execution_time') {
            this.performanceStats.toolExecutionTime.push({
                count: 1,
                sum: value,
                average: value,
                min: value,
                max: value,
                last: value
            });
            this.performanceStats.totalExecutions++;
        }
    }
    getMetricStats(name) {
        const metrics = this.metrics.get(name) || [];
        if (metrics.length === 0) {
            return {
                count: 0,
                sum: 0,
                average: 0,
                min: 0,
                max: 0,
                last: 0
            };
        }
        const stats = {
            count: metrics.length,
            sum: metrics.reduce((sum, m) => sum + m.value, 0),
            average: metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length,
            min: Math.min(...metrics.map(m => m.value)),
            max: Math.max(...metrics.map(m => m.value)),
            last: metrics[metrics.length - 1].value
        };
        return stats;
    }
    getPerformanceStats() {
        // 计算错误率
        if (this.performanceStats.totalExecutions > 0) {
            this.performanceStats.errorRate =
                this.performanceStats.errorExecutions / this.performanceStats.totalExecutions;
            this.performanceStats.successRate =
                100 - (this.performanceStats.errorRate * 100);
        }
        return { ...this.performanceStats };
    }
    configureAlert(metricName, config) {
        console.log(`Alert configured for ${metricName}: ${config.severity} > ${config.threshold}`);
    }
    recordError() {
        this.performanceStats.errorExecutions++;
    }
    clearOldData(ageInMs) {
        const cutoffTime = Date.now() - ageInMs;
        for (const [name, metrics] of this.metrics) {
            const filtered = metrics.filter(m => m.timestamp > cutoffTime);
            if (filtered.length === 0) {
                this.metrics.delete(name);
            }
            else {
                this.metrics.set(name, filtered);
            }
        }
    }
    reset() {
        this.metrics.clear();
        this.performanceStats = {
            toolExecutionTime: [],
            errorRate: 0,
            successRate: 100,
            totalExecutions: 0,
            errorExecutions: 0
        };
    }
    exportMetrics() {
        const allMetrics = [];
        for (const metrics of this.metrics.values()) {
            allMetrics.push(...metrics);
        }
        return allMetrics;
    }
}
exports.MetricsCollector = MetricsCollector;
//# sourceMappingURL=MetricsCollector.js.map