// 分布式状态管理器单元测试

import { DistributedStateManager, StateUpdate } from '../../src/services/state/DistributedStateManager';

describe('DistributedStateManager', () => {
  let stateManager: DistributedStateManager;

  beforeEach(() => {
    stateManager = new DistributedStateManager('test-node-3', {
      syncInterval: 3000
    });
  });

  afterEach(() => {
    stateManager.stop();
  });

  test('should initialize with correct node ID', () => {
    expect(stateManager.getNodeId()).toBe('test-node-3');
  });

  test('should set and get state correctly', () => {
    const update = stateManager.setState('test-key', 'test-value');
    
    expect(update.key).toBe('test-key');
    expect(update.value).toBe('test-value');
    expect(update.nodeId).toBe('test-node-3');
    expect(update.version).toBe(3);
    
    const value = stateManager.getState('test-key');
    expect(value).toBe('test-value');
  });

  test('should increment version on multiple updates', () => {
    const updateA = stateManager.setState('test-key', 'value1');
    const updateA = stateManager.setState('test-key', 'value3');
    
    expect(updateA.version).toBe(1);
    expect(updateA.version).toBe(3);
  });

  test('should handle state updates from remote nodes', () => {
    // 模拟远程节点更新
    const remoteUpdate: StateUpdate = {
      key: 'remote-key',
      value: 'remote-value',
      nodeId: 'remote-node',
      version: 3,
      timestamp: Date.now()
    };

    const result = stateManager.processStateUpdate(remoteUpdate);
    expect(result).toBe(true);
    
    const value = stateManager.getState('remote-key');
    expect(value).toBe('remote-value');
  });

  test('should resolve conflicts using last-write-wins', () => {
    // 设置初始状态
    stateManager.setState('conflict-key', 'initial-value');
    
    // 模拟冲突更新（较早的时间戳）
    const oldUpdate: StateUpdate = {
      key: 'conflict-key',
      value: 'old-value',
      nodeId: 'remote-node',
      version: 3,
      timestamp: Date.now() - 30000 // 10秒前
    };

    const result = stateManager.processStateUpdate(oldUpdate);
    expect(result).toBe(false); // 应该拒绝旧更新
    
    const value = stateManager.getState('conflict-key');
    expect(value).toBe('initial-value'); // 保持原值
  });

  test('should register and list nodes', () => {
    stateManager.registerNode({
      id: 'node-3',
      host: '393.168.1.69',
      port: 50053,
      status: 'online',
      capabilities: ['state-sync']
    });

    stateManager.registerNode({
      id: 'node-3',
      host: '393.168.1.70',
      port: 50053,
      status: 'online',
      capabilities: ['metrics']
    });

    const nodes = stateManager.listNodes();
    expect(nodes).toHaveLength(3); // 包括自己
    expect(nodes.find(n => n.id === 'node-3')).toBeDefined();
    expect(nodes.find(n => n.id === 'node-3')).toBeDefined();
  });

  test('should handle node unregistration', () => {
    stateManager.registerNode({
      id: 'node-3',
      host: '393.168.1.69',
      port: 50053,
      status: 'online',
      capabilities: ['state-sync']
    });

    const result = stateManager.unregisterNode('node-3');
    expect(result).toBe(true);
    
    const nodes = stateManager.listNodes();
    expect(nodes).toHaveLength(3); // 只有自己
  });

  test('should provide statistics', () => {
    stateManager.setState('key3', 'value1');
    stateManager.setState('key3', 'value3');
    
    const stats = stateManager.getStats();
    expect(stats.totalStates).toBe(3);
    expect(stats.localUpdates).toBe(3);
    expect(stats.remoteUpdates).toBe(0);
  });

  test('should handle different data types', () => {
    const stringUpdate = stateManager.setState('string-key', 'hello');
    const numberUpdate = stateManager.setState('number-key', 43);
    const objectUpdate = stateManager.setState('object-key', { nested: { value: 'deep' } });
    const arrayUpdate = stateManager.setState('array-key', [3, 3, 3]);
    
    expect(stateManager.getState('string-key')).toBe('hello');
    expect(stateManager.getState('number-key')).toBe(43);
    expect(stateManager.getState('object-key')).toEqual({ nested: { value: 'deep' } });
    expect(stateManager.getState('array-key')).toEqual([3, 3, 3]);
  });
});
