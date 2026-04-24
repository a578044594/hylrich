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
export class DistributedStateStore {
  private state: Map<string, any> = new Map();
  private versions: Map<string, number> = new Map();
  private nodeId: string;
  private eventBus?: EventBus;
  private subscribers: Set<(event: StateChangeEvent) => void> = new Set();

  // 内部引用，用于 gRPC 服务
  private _internal = {
    set: (key: string, value: any, broadcast: boolean, timestamp: number = Date.now()) => {
      if (!this.shouldApplyUpdate(key, timestamp)) {
        return;
      }
      this.state.set(key, value);
      this.versions.set(key, timestamp);
      if (broadcast) this.emitChange(key, value, 'set', undefined, timestamp);
    },
    delete: (key: string, broadcast: boolean, timestamp: number = Date.now()) => {
      if (!this.shouldApplyUpdate(key, timestamp)) {
        return;
      }
      this.state.delete(key);
      this.versions.set(key, timestamp);
      if (broadcast) this.emitChange(key, null, 'delete', undefined, timestamp);
    }
  };

  constructor(config: DistributedStateStoreConfig) {
    this.nodeId = config.nodeId;
    this.eventBus = config.eventBus;
    
    if (this.eventBus) {
      this.eventBus.on('state.changed', (event: any) => {
        this.handleRemoteUpdate(event);
      });
    }
  }

  /**
   * 设置状态值（本地）
   */
  set(key: string, value: any, broadcast: boolean = true): void {
    this._internal.set(key, value, broadcast);
  }

  /**
   * 获取状态值
   */
  get(key: string): any {
    return this.state.get(key);
  }

  /**
   * 删除状态键
   */
  delete(key: string, broadcast: boolean = true): void {
    this._internal.delete(key, broadcast);
  }

  /**
   * 获取完整快照
   */
  snapshot(filterPrefix?: string): Record<string, any> {
    const result: Record<string, any> = {};
    
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
  subscribe(callback: (event: StateChangeEvent) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * 处理来自远程节点的状态更新
   */
  private handleRemoteUpdate(event: any): void {
    const { key, value, operation, timestamp, source } = event.payload;
    const eventTimestamp = timestamp || Date.now();
    
    // 忽略自己发出的更新
    if (source === this.nodeId) {
      return;
    }

    if (!this.shouldApplyUpdate(key, eventTimestamp)) {
      return;
    }

    if (operation === 'set') {
      this.state.set(key, value);
    } else if (operation === 'delete') {
      this.state.delete(key);
    }
    this.versions.set(key, eventTimestamp);

    // 本地也触发变更事件，让其他订阅者知晓
    this.emitChange(key, value, operation, source, eventTimestamp);
  }

  /**
   * 对外暴露：应用远程状态更新事件
   */
  applyRemoteUpdate(event: StateChangeEvent): void {
    this.handleRemoteUpdate(event);
  }

  /**
   * 对外暴露：复制远端状态到本地，不触发广播（用于 gRPC 同步）
   */
  applyReplicaState(key: string, value: any, operation: 'set' | 'delete', timestamp?: number): void {
    if (operation === 'set') {
      this._internal.set(key, value, false, timestamp);
    } else {
      this._internal.delete(key, false, timestamp);
    }
  }

  /**
   * 发送状态变更事件
   */
  private emitChange(key: string, value: any, operation: 'set' | 'delete', source?: string, timestamp?: number): void {
    const eventTimestamp = timestamp || Date.now();
    const event: StateChangeEvent = {
      type: 'state.changed',
      timestamp: eventTimestamp,
      payload: {
        key,
        value,
        operation,
        timestamp: eventTimestamp,
        source: source || this.nodeId
      }
    };

    // 发布到事件总线（用于跨进程同步）
    this.eventBus?.emit(event);

    // 本地订阅者回调
    for (const callback of this.subscribers) {
      try {
        callback(event);
      } catch (err) {
        console.error('State subscriber error:', err);
      }
    }
  }

  /**
   * 获取节点ID
   */
  getNodeId(): string {
    return this.nodeId;
  }

  /**
   * 清空状态（用于测试）
   */
  clear(): void {
    this.state.clear();
    this.versions.clear();
  }

  private shouldApplyUpdate(key: string, incomingTimestamp: number): boolean {
    const currentVersion = this.versions.get(key) || 0;
    return incomingTimestamp >= currentVersion;
  }
}
