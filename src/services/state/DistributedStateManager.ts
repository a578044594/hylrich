// 分布式状态管理器

import { EventEmitter } from 'events';

export interface StateUpdate {
  key: string;
  value: any;
  nodeId: string;
  version: number;
  timestamp: number;
}

export interface NodeInfo {
  id: string;
  host: string;
  port: number;
  status: 'online' | 'offline' | 'error';
  capabilities: string[];
}

export interface StateStats {
  totalStates: number;
  localUpdates: number;
  remoteUpdates: number;
}

export class DistributedStateManager extends EventEmitter {
  private nodeId: string;
  private states: Map<string, { value: any; version: number; timestamp: number }> = new Map();
  private remoteStates: Map<string, { value: any; version: number; nodeId: string; timestamp: number }> = new Map();
  private nodes: Map<string, NodeInfo> = new Map();
  private versionCounter: number = 0;
  private syncInterval: number;

  constructor(nodeId: string, config: { syncInterval?: number } = {}) {
    super();
    this.nodeId = nodeId;
    this.syncInterval = config.syncInterval || 1000;
    
    console.log(`DistributedStateManager initialized for node: ${nodeId}`);
    
    // 启动定期同步
    setInterval(() => {
      this.emit('sync');
    }, this.syncInterval);
  }

  start(): void {
    // 启动定期同步
    console.log('DistributedStateManager started');
  }

  stop(): void {
    this.removeAllListeners();
    console.log('DistributedStateManager stopped');
  }

  setNodeId(nodeId: string): void {
    this.nodeId = nodeId;
  }

  getNodeId(): string {
    return this.nodeId;
  }

  setState(key: string, value: any): StateUpdate {
    this.versionCounter++;
    const update: StateUpdate = {
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

  getState(key: string): any {
    const state = this.states.get(key);
    return state ? state.value : null;
  }

  processStateUpdate(update: StateUpdate): boolean {
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

  registerNode(nodeInfo: NodeInfo): void {
    this.nodes.set(nodeInfo.id, nodeInfo);
    this.emit('nodeRegistered', nodeInfo);
  }

  unregisterNode(nodeId: string): boolean {
    if (!this.nodes.has(nodeId)) {
      return false;
    }

    this.nodes.delete(nodeId);
    this.emit('nodeUnregistered', nodeId);
    
    return true;
  }

  listNodes(): NodeInfo[] {
    return Array.from(this.nodes.values());
  }

  getStats(): StateStats {
    return {
      totalStates: this.states.size,
      localUpdates: this.versionCounter,
      remoteUpdates: this.remoteStates.size
    };
  }
}
