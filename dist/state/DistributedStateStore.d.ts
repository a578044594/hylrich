import { EventBus } from '../core/EventBus';
import { Event } from '../types/events';
export interface StateChangeEvent extends Event {
    type: 'state.changed';
    payload: {
        key: string;
        value: any;
        operation: 'set' | 'delete';
        timestamp: number;
        source?: string;
    };
}
export interface DistributedStateStoreConfig {
    nodeId: string;
    eventBus?: EventBus;
}
/**
 * 分布式状态存储
 * 本地状态管理 + 事件发布，通过 gRPC 同步到其他节点
 */
export declare class DistributedStateStore {
    private state;
    private nodeId;
    private eventBus?;
    private subscribers;
    constructor(config: DistributedStateStoreConfig);
    /**
     * 设置状态值（本地）
     */
    set(key: string, value: any, broadcast?: boolean): void;
    /**
     * 获取状态值
     */
    get(key: string): any;
    /**
     * 删除状态键
     */
    delete(key: string, broadcast?: boolean): void;
    /**
     * 获取完整快照
     */
    snapshot(filterPrefix?: string): Record<string, any>;
    /**
     * 订阅状态变更
     */
    subscribe(callback: (event: StateChangeEvent) => void): () => void;
    /**
     * 处理来自远程节点的状态更新
     */
    private handleRemoteUpdate;
    /**
     * 发送状态变更事件
     */
    private emitChange;
    /**
     * 获取节点ID
     */
    getNodeId(): string;
    /**
     * 清空状态（用于测试）
     */
    clear(): void;
}
