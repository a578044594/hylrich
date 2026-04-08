// 高级状态同步服务单元测试

import { AdvancedStateSyncService } from '../../../src/services/state/AdvancedStateSyncService';

describe('AdvancedStateSyncService', () => {
  let syncService: AdvancedStateSyncService;

  beforeEach(async () => {
    syncService = new AdvancedStateSyncService({
      nodeId: 'test-node-1',
      syncInterval: 100,
      replicationFactor: 2
    });
  });

  afterEach(async () => {
    await syncService.stop();
  });

  test('should initialize with correct configuration', () => {
    expect(syncService).toBeDefined();
    
    const status = syncService.getServiceStatus();
    expect(status.nodeId).toBe('test-node-1');
    expect(status.clusterStats.replicationFactor).toBe(2);
  });

  test('should start and stop service correctly', async () => {
    await syncService.start();
    
    const status = syncService.getServiceStatus();
    expect(status.isRunning).toBe(true);
    
    await syncService.stop();
    expect(syncService.getServiceStatus().isRunning).toBe(false);
  });

  test('should set and get state through service', () => {
    const update = syncService.setState('test-key', 'test-value');
    
    expect(update.key).toBe('test-key');
    expect(update.value).toBe('test-value');
    expect(update.nodeId).toBe('test-node-1');
    
    const value = syncService.getState('test-key');
    expect(value).toBe('test-value');
  });

  test('should handle cluster node management', () => {
    const nodeInfo = {
      id: 'test-node-2',
      host: '192.168.1.69',
      port: 50051,
      status: 'online' as const,
      capabilities: ['state-sync'],
      lastHeartbeat: Date.now()
    };

    const result = syncService.addClusterNode(nodeInfo);
    expect(result).toBe(true);
    
    const stats = syncService.getClusterStats();
    expect(stats.totalNodes).toBe(1);
    expect(stats.onlineNodes).toBe(1);
    
    const removeResult = syncService.removeClusterNode('test-node-2');
    expect(removeResult).toBe(true);
    expect(syncService.getClusterStats().totalNodes).toBe(0);
  });

  test('should update node heartbeat', () => {
    const nodeInfo = {
      id: 'test-node-2',
      host: '192.168.1.69',
      port: 50051,
      status: 'online' as const,
      capabilities: ['state-sync'],
      lastHeartbeat: Date.now()
    };

    syncService.addClusterNode(nodeInfo);
    
    const result = syncService.updateNodeHeartbeat('test-node-2');
    expect(result).toBe(true);
  });

  test('should register custom sync strategies', () => {
    const customStrategy = {
      name: 'custom-strategy',
      shouldReplicate: (update: any, targetNode: any) => {
        return targetNode.id.includes('important');
      },
      resolveConflict: (local: any, remote: any) => {
        return local.version > remote.version ? local : remote;
      }
    };

    const result = syncService.registerSyncStrategy('custom-strategy', customStrategy);
    expect(result).toBe(true);
  });

  test('should handle different data types through service', () => {
    const stringUpdate = syncService.setState('string-key', 'hello');
    const numberUpdate = syncService.setState('number-key', 42);
    const objectUpdate = syncService.setState('object-key', { nested: { value: 'deep' } });
    const arrayUpdate = syncService.setState('array-key', [1, 2, 3]);
    const booleanUpdate = syncService.setState('boolean-key', true);
    
    expect(syncService.getState('string-key')).toBe('hello');
    expect(syncService.getState('number-key')).toBe(42);
    expect(syncService.getState('object-key')).toEqual({ nested: { value: 'deep' } });
    expect(syncService.getState('array-key')).toEqual([1, 2, 3]);
    expect(syncService.getState('boolean-key')).toBe(true);
  });

  test('should provide detailed service status', async () => {
    await syncService.start();
    
    const status = syncService.getServiceStatus();
    
    expect(status).toHaveProperty('isRunning');
    expect(status).toHaveProperty('nodeId');
    expect(status).toHaveProperty('clusterStats');
    expect(status).toHaveProperty('syncStrategy');
    expect(status).toHaveProperty('clusterNodes');
    
    expect(status.isRunning).toBe(true);
    expect(status.nodeId).toBe('test-node-1');
    expect(status.clusterStats).toEqual({
      totalNodes: 0,
      onlineNodes: 0,
      offlineNodes: 0,
      replicationFactor: 2
    });
  });

  test('should handle state update events', (done) => {
    syncService.on('stateUpdate', (update) => {
      expect(update.key).toBe('event-test-key');
      expect(update.value).toBe('event-test-value');
      done();
    });

    syncService.setState('event-test-key', 'event-test-value');
  });

  test('should handle cluster node events', (done) => {
    const nodeInfo = {
      id: 'event-node',
      host: '192.168.1.70',
      port: 50052,
      status: 'online' as const,
      capabilities: ['state-sync'],
      lastHeartbeat: Date.now()
    };

    syncService.on('clusterNodeAdded', (node) => {
      expect(node.id).toBe('event-node');
      done();
    });

    syncService.addClusterNode(nodeInfo);
  });

  test('should detect offline nodes', async () => {
    const nodeInfo = {
      id: 'test-node-2',
      host: '192.168.1.69',
      port: 50051,
      status: 'online' as const,
      capabilities: ['state-sync'],
      lastHeartbeat: Date.now() - 10000 // 10秒前
    };

    syncService.addClusterNode(nodeInfo);
    
    // 手动标记为离线
    syncService['clusterNodes'].get('test-node-2')!.status = 'offline';
    
    const stats = syncService.getClusterStats();
    expect(stats.offlineNodes).toBe(1);
  });
});
