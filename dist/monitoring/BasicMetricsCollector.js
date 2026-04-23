"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicMetricsCollector = void 0;
const MetricsCollector_1 = require("./MetricsCollector");
class BasicMetricsCollector extends MetricsCollector_1.MetricsCollector {
    constructor() {
        super(...arguments);
        this.metrics = new Map();
    }
    collectMetrics() {
        const result = {};
        for (const [metricName, values] of this.metrics.entries()) {
            if (values.length > 0) {
                result[metricName] = {
                    count: values.length,
                    sum: values.reduce((a, b) => a + b, 0),
                    avg: values.reduce((a, b) => a + b, 0) / values.length,
                    min: Math.min(...values),
                    max: Math.max(...values)
                };
            }
        }
        return result;
    }
    recordMetric(name, value, tags) {
        const metricKey = tags ? `${name}_${JSON.stringify(tags)}` : name;
        if (!this.metrics.has(metricKey)) {
            this.metrics.set(metricKey, []);
        }
        this.metrics.get(metricKey).push(value);
    }
    clearMetrics() {
        this.metrics.clear();
    }
}
exports.BasicMetricsCollector = BasicMetricsCollector;
//# sourceMappingURL=BasicMetricsCollector.js.map