"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateSyncService = void 0;
const events_1 = require("events");
class StateSyncService extends events_1.EventEmitter {
    constructor() {
        super();
        this.states = new Map();
    }
    async start() {
        console.log('🔄 状态同步服务启动（无gRPC依赖）');
    }
    async stop() {
        console.log('🔄 状态同步服务停止');
    }
    async saveState(key, value) {
        this.states.set(key, value);
    }
    async loadState(key) {
        return this.states.get(key);
    }
    async getAllStates() {
        return this.states;
    }
}
exports.StateSyncService = StateSyncService;
//# sourceMappingURL=StateSyncService.js.map