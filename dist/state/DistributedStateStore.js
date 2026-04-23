"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributedStateStore = void 0;
/**
 * 分布式状态存储
 * 本地状态管理 + 事件发布，通过 gRPC 同步到其他节点
 */
class DistributedStateStore {
    constructor(config) {
        this.state = new Map();
        this.subscribers = new Set();
        this.nodeId = config.nodeId;
        this.eventBus = config.eventBus;
        // 监听本地状态变更事件（用于接收其他 agent 的更新）
        if (this.eventBus) {
            this.eventBus.on('state.update', (event) => {
                this.handleRemoteUpdate(event);
            });
        }
    }
    /**
     * 设置状态值（本地）
     */
    set(key, value, broadcast = true) {
        this.state.set(key, value);
        if (broadcast) {
            this.emitChange(key, value, 'set');
        }
    }
    /**
     * 获取状态值
     */
    get(key) {
        return this.state.get(key);
    }
    /**
     * 删除状态键
     */
    delete(key, broadcast = true) {
        this.state.delete(key);
        if (broadcast) {
            this.emitChange(key, null, 'delete');
        }
    }
    /**
     * 获取完整快照
     */
    snapshot(filterPrefix) {
        const result = {};
        for (const [key, value] of this.state.entries()) {
            if (filterPrefix && !key.startsWith(filterPrefix)) {
                continue;
            }
            result[key] = value;
        }
        return result;
    }
    /**
     * 订阅状态变更
     */
    subscribe(callback) {
        this.subscribers.add(callback);
        // 返回取消订阅函数
        return () => {
            this.subscribers.delete(callback);
        };
    }
    /**
     * 处理来自远程节点的状态更新
     */
    handleRemoteUpdate(event) {
        const { key, value, operation, timestamp, source } = event.payload;
        // 忽略自己发出的更新（避免循环）
        if (source === this.nodeId) {
            return;
        }
        if (operation === 'set') {
            this.state.set(key, value);
        }
        else if (operation === 'delete') {
            this.state.delete(key);
        }
        // 本地也触发变更事件，让其他订阅者知晓
        this.emitChange(key, value, operation, source);
    }
    /**
     * 发送状态变更事件
     */
    emitChange(key, value, operation, source) {
        const event = {
            type: 'state.changed',
            timestamp: Date.now(),
            payload: {
                key,
                value,
                operation,
                timestamp: Date.now(),
                source: source || this.nodeId
            }
        };
        // 发布到事件总线（用于跨进程同步）
        this.eventBus?.emit(event);
        // 本地订阅者回调
        for (const callback of this.subscribers) {
            try {
                callback(event);
            }
            catch (err) {
                console.error('State subscriber error:', err);
            }
        }
    }
    /**
     * 获取节点ID
     */
    getNodeId() {
        return this.nodeId;
    }
    /**
     * 清空状态（用于测试）
     */
    clear() {
        this.state.clear();
    }
}
exports.DistributedStateStore = DistributedStateStore;
//# sourceMappingURL=DistributedStateStore.js.map