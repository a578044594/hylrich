"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertManager = void 0;
const EventEmitter_1 = require("../../core/EventEmitter");
class AlertManager extends EventEmitter_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.alerts = new Map();
        this.lastAlertTime = new Map();
    }
    configureAlert(alertId, config) {
        this.alerts.set(alertId, config);
        console.log(`Alert configured for ${config.metricName}: ${config.type} > ${config.threshold}`);
    }
    checkAlert(metricName, value) {
        for (const [alertId, config] of this.alerts.entries()) {
            if (config.metricName === metricName && value > config.threshold) {
                const now = Date.now();
                const lastTime = this.lastAlertTime.get(alertId) || 0;
                // 检查冷却时间
                if (!config.cooldown || now - lastTime > config.cooldown) {
                    this.lastAlertTime.set(alertId, now);
                    const alertMessage = `${config.type.toUpperCase()}: ${metricName} value ${value} exceeds threshold ${config.threshold}`;
                    this.emit('alert', {
                        alertId,
                        metricName,
                        value,
                        threshold: config.threshold,
                        type: config.type,
                        message: alertMessage
                    });
                    console.log(alertMessage);
                }
            }
        }
    }
    removeAlert(alertId) {
        this.alerts.delete(alertId);
        this.lastAlertTime.delete(alertId);
    }
    getAlerts() {
        return Array.from(this.alerts.values());
    }
}
exports.AlertManager = AlertManager;
//# sourceMappingURL=AlertManager.js.map