"use strict";
// 分布式状态管理器
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributedStateManager = void 0;
const events_1 = require("events");
class DistributedStateManager extends events_1.EventEmitter {
    constructor(nodeId, config = {}) {
        super();
        this.states = new Map();
        this.remoteStates = new Map();
        this.nodes = new Map();
        this.versionCounter = 0;
        this.nodeId = nodeId;
        this.syncInterval = config.syncInterval || 1000;
        console.log(`DistributedStateManager initialized for node: ${nodeId}`);
        // 启动定期同步
        setInterval(() => {
            this.emit('sync');
        }, this.syncInterval);
    }
    start() {
        // 启动定期同步
        console.log('DistributedStateManager started');
    }
    stop() {
        this.removeAllListeners();
        console.log('DistributedStateManager stopped');
    }
    setNodeId(nodeId) {
        this.nodeId = nodeId;
    }
    getNodeId() {
        return this.nodeId;
    }
    setState(key, value) {
        this.versionCounter++;
        const update = {
            key,
            value,
            nodeId: this.nodeId,
            version: this.versionCounter,
            timestamp: Date.now()
        };
        this.states.set(key, {
            value,
            version: this.versionCounter,
            timestamp: Date.now()
        });
        this.emit('stateUpdate', update);
        return update;
    }
    getState(key) {
        const state = this.states.get(key);
        return state ? state.value : null;
    }
    processStateUpdate(update) {
        // 检查版本冲突
        const existingState = this.states.get(update.key);
        if (existingState && update.version <= existingState.version) {
            return false; // 版本冲突
        }
        // 检查时间戳冲突（Last-Write-Wins）
        if (existingState && update.timestamp < existingState.timestamp) {
            return false; // 时间戳冲突
        }
        // 更新状态
        this.states.set(update.key, {
            value: update.value,
            version: update.version,
            timestamp: update.timestamp
        });
        this.remoteStates.set(update.key, {
            value: update.value,
            version: update.version,
            nodeId: update.nodeId,
            timestamp: update.timestamp
        });
        this.emit('remoteStateUpdate', update);
        return true;
    }
    registerNode(nodeInfo) {
        this.nodes.set(nodeInfo.id, nodeInfo);
        this.emit('nodeRegistered', nodeInfo);
    }
    unregisterNode(nodeId) {
        if (!this.nodes.has(nodeId)) {
            return false;
        }
        this.nodes.delete(nodeId);
        this.emit('nodeUnregistered', nodeId);
        return true;
    }
    listNodes() {
        return Array.from(this.nodes.values());
    }
    getStats() {
        return {
            totalStates: this.states.size,
            localUpdates: this.versionCounter,
            remoteUpdates: this.remoteStates.size
        };
    }
}
exports.DistributedStateManager = DistributedStateManager;
//# sourceMappingURL=DistributedStateManager.js.map