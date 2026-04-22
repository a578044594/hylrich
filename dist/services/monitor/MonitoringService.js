"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringService = void 0;
const events_1 = require("events");
// 完全重写，不依赖 GrpcClient
class MonitoringService extends events_1.EventEmitter {
    constructor() {
        super();
        this.metrics = {};
    }
    async start() {
        console.log('📊 监控服务启动（无gRPC依赖）');
    }
    async stop() {
        console.log('📊 监控服务停止');
    }
    recordMetric(name, value, tags) {
        if (!this.metrics[name]) {
            this.metrics[name] = [];
        }
        this.metrics[name].push({ timestamp: Date.now(), value, tags });
    }
    getMetrics() {
        return this.metrics;
    }
}
exports.MonitoringService = MonitoringService;
//# sourceMappingURL=MonitoringService.js.map