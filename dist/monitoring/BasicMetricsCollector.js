"use strict";
// 基础指标收集器
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicMetricsCollector = void 0;
const events_1 = require("events");
class BasicMetricsCollector extends events_1.EventEmitter {
    constructor() {
        super();
        this.metrics = new Map();
        console.log('BasicMetricsCollector initialized');
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
        // 触发指标更新事件
        this.emit('metric', metric);
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
    exportMetrics() {
        const allMetrics = [];
        for (const metrics of this.metrics.values()) {
            allMetrics.push(...metrics);
        }
        return allMetrics;
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
        console.log('BasicMetricsCollector reset');
    }
}
exports.BasicMetricsCollector = BasicMetricsCollector;
//# sourceMappingURL=BasicMetricsCollector.js.map