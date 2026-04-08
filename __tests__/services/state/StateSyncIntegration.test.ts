// 状态同步系统集成测试

import { AdvancedStateSyncService } from '../../../src/services/state/AdvancedStateSyncService';

describe('StateSync Integration', () => {
  let node1: AdvancedStateSyncService;
  let node2: AdvancedStateSyncService;

  beforeEach(() => {
    // 创建两个节点来模拟集群
    node1 = new AdvancedStateSyncService({
      nodeId: 'node-1',
      syncInterval: 100,
      replicationFactor: 1
    });

    node2 = new AdvancedStateSyncService({
      nodeId: 'node-2', 
      syncInterval: 100,
      replicationFactor: 1
    });
  });

  afterEach(() => {
    node1.stop();
    node2.stop();
  });

  test('should form a cluster with multiple nodes', () => {
    // 添加节点到集群
    node1.addClusterNode({
      id: 'node-2',
      host: '192.168.1.70',
      port: 50052,
      status: 'online',
      capabilities: ['state-sync'],
      lastHeartbeat: Date.now()
    });

    node2.addClusterNode({
      id: 'node-1',
      host: '192.168.1.69',
      port: 50051,
      status: 'online',
      capabilities: ['state-sync'],
      lastHeartbeat: Date.now()
    });

    // 检查集群状态
    const stats1 = node1.getClusterStats();
    const stats2 = node2.getClusterStats();

    expect(stats1.totalNodes).toBe(1);
    expect(stats2.totalNodes).toBe(1);
    expect(stats1.onlineNodes).toBe(1);
    expect(stats2.onlineNodes).toBe(1);
  });

  test('should handle conflict resolution', () => {
    // 在两个节点上设置相同的键但不同的值
    const update1 = node1.setState('conflict-key', 'value-from-node1');
    const update2 = node2.setState('conflict-key', 'value-from-node2');

    // 模拟冲突解决
    const resolved = node1['syncStrategies'].get('last-write-wins')!.resolveConflict(update1, update2);
    
    // 应该选择时间戳最新的更新
    const expected = update1.timestamp > update2.timestamp ? update1 : update2;
    expect(resolved).toBe(expected);
  });

  test('should handle node failure scenarios', () => {
    // 添加节点
    node1.addClusterNode({
      id: 'node-2',
      host: '192.168.1.70',
      port: 50052,
      status: 'online',
      capabilities: ['state-sync'],
      lastHeartbeat: Date.now() - 10000 // 10秒前
    });

    // 手动标记为离线
    node1['clusterNodes'].get('node-2')!.status = 'offline';

    const stats = node1.getClusterStats();
    expect(stats.offlineNodes).toBe(1);
    expect(stats.onlineNodes).toBe(0);
  });

  test('should support different sync strategies', () => {
    // 测试last-write-wins策略
    const update1 = { key: 'test', value: 'v1', nodeId: 'node1', version: 1, timestamp: Date.now() - 1000 };
    const update2 = { key: 'test', value: 'v2', nodeId: 'node2', version: 2, timestamp: Date.now() };
    
    const lwwResult = node1['syncStrategies'].get('last-write-wins')!.resolveConflict(update1, update2);
    expect(lwwResult).toBe(update2); // 应该选择时间戳最新的

    // 测试version-based策略
    const update3 = { key: 'test', value: 'v3', nodeId: 'node3', version: 3, timestamp: Date.now() - 500 };
    const update4 = { key: 'test', value: 'v4', nodeId: 'node4', version: 4, timestamp: Date.now() - 1000 };
    
    const vbResult = node1['syncStrategies'].get('version-based')!.resolveConflict(update3, update4);
    expect(vbResult).toBe(update4); // 应该选择版本号更高的
  });

  test('should maintain service status consistency', () => {
    const status1 = node1.getServiceStatus();
    const status2 = node2.getServiceStatus();

    // 两个节点应该有相同的配置
    expect(status1.clusterStats.replicationFactor).toBe(status2.clusterStats.replicationFactor);
    expect(status1.syncStrategy).toBe(status2.syncStrategy);
    
    // 但节点ID应该不同
    expect(status1.nodeId).not.toBe(status2.nodeId);
  });
});
