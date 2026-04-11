"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsCollector = void 0;
const AlertManager_1 = require("./alerts/AlertManager");
class MetricsCollector {
    constructor() {
        this.metrics = [];
        this.executionCount = 0;
        this.errorCount = 0;
        this.alertManager = new AlertManager_1.AlertManager();
        console.log('MetricsCollector initialized');
    }
    recordMetric(name, value, tags, unit) {
        const metric = {
            name,
            value,
            timestamp: Date.now(),
            tags: { ...tags, unit }
        };
        this.metrics.push(metric);
        // 检查警报
        this.alertManager.checkAlert(name, value);
    }
    recordError() {
        this.errorCount++;
        this.executionCount++;
    }
    recordSuccess() {
        this.executionCount++;
    }
    configureAlert(metricName, type, threshold, cooldown) {
        this.alertManager.configureAlert(`${metricName}_${type}`, {
            metricName,
            threshold,
            type,
            cooldown
        });
    }
    getPerformanceStats() {
        const totalExecutions = this.executionCount;
        const errorRate = totalExecutions > 0 ? (this.errorCount / totalExecutions) * 100 : 0;
        const successRate = 100 - errorRate;
        return {
            totalExecutions,
            errorCount: this.errorCount,
            errorRate,
            successRate,
            toolExecutionTime: this.metrics
                .filter(m => m.name === 'tool_execution_time')
                .map(m => m.value)
        };
    }
    exportMetrics() {
        return [...this.metrics];
    }
    clearOldData(maxAge) {
        const cutoffTime = Date.now() - maxAge;
        this.metrics = this.metrics.filter(m => m.timestamp >= cutoffTime);
    }
    reset() {
        this.metrics = [];
        this.executionCount = 0;
        this.errorCount = 0;
    }
}
exports.MetricsCollector = MetricsCollector;
//# sourceMappingURL=MetricsCollector.js.map