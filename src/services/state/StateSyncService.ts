// 状态同步服务 - 集成gRPC进行分布式状态同步

import { DistributedStateManager, StateUpdate } from './DistributedStateManager';
import { GrpcClient } from '../../protocols/grpc/GrpcClient';

export interface StateSyncServiceConfig {
  nodeId: string;
  grpcHost: string;
  grpcPort: number;
  syncInterval?: number;
}

export class StateSyncService {
  private stateManager: DistributedStateManager;
  private grpcClient: GrpcClient;
  private config: StateSyncServiceConfig;
  private isRunning: boolean = false;

  constructor(config: StateSyncServiceConfig) {
    this.config = config;
    
    this.stateManager = new DistributedStateManager(config.nodeId, {
      syncInterval: config.syncInterval || 3000
    });

    this.grpcClient = new GrpcClient({
      host: config.grpcHost,
      port: config.grpcPort
    });
  }

  // 启动服务
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('StateSyncService is already running');
      return;
    }

    try {
      // 测试gRPC连接
      const health = await this.grpcClient.healthCheck({});
      console.log('gRPC connection established:', health.status);

      this.stateManager.start();
      this.isRunning = true;
      
      console.log(`StateSyncService started for node: ${this.config.nodeId}`);
      
      // 开始状态同步循环
      this.startSyncLoop();
      
    } catch (error) {
      console.error('Failed to start StateSyncService:', error);
      throw error;
    }
  }

  // 停止服务
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.stateManager.stop();
    await this.grpcClient.close();
    this.isRunning = false;
    
    console.log('StateSyncService stopped');
  }

  // 状态同步循环
  private startSyncLoop(): void {
    // 这里会实现实际的状态同步逻辑
    // 定期从其他节点获取状态更新
    console.log('State sync loop started');
  }

  // 设置本地状态并广播
  async setState(key: string, value: any): Promise<StateUpdate> {
    const update = this.stateManager.setState(key, value);
    
    // 广播到其他节点（模拟）
    console.log(`State updated: ${key} = ${JSON.stringify(value)}`);
    console.log('Broadcasting to other nodes...');
    
    return update;
  }

  // 获取本地状态
  getState(key: string): any {
    return this.stateManager.getState(key);
  }

  // 处理来自其他节点的状态更新
  async processRemoteUpdate(update: StateUpdate): Promise<boolean> {
    return this.stateManager.processStateUpdate(update);
  }

  // 获取服务状态
  getServiceStatus(): any {
    return {
      isRunning: this.isRunning,
      nodeId: this.config.nodeId,
      stats: this.stateManager.getStats(),
      grpcConnected: !!this.grpcClient
    };
  }

  // 注册其他节点
  registerRemoteNode(nodeInfo: any): void {
    this.stateManager.registerNode({
      id: nodeInfo.id,
      host: nodeInfo.host,
      port: nodeInfo.port,
      status: 'online',
      capabilities: nodeInfo.capabilities || []
    });
  }

  // 发现其他节点（模拟）
  async discoverNodes(): Promise<void> {
    console.log('Discovering other nodes...');
    
    // 模拟发现节点
    const mockNodes = [
      {
        id: 'node-2',
        host: '192.168.1.69',
        port: 50051,
        capabilities: ['state-sync', 'tools']
      },
      {
        id: 'node-3', 
        host: '192.168.1.70',
        port: 50052,
        capabilities: ['state-sync', 'metrics']
      }
    ];

    for (const node of mockNodes) {
      this.registerRemoteNode(node);
    }
  }
}
