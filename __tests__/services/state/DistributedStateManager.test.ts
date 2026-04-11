import { DistributedStateManager, StateUpdate, NodeInfo } from '../../src/services/state/DistributedStateManager';

describe('DistributedStateManager', () => {
  let stateManager: DistributedStateManager;

  beforeEach(() => {
    stateManager = new DistributedStateManager();
  });

  it('should register and list nodes', () => {
    stateManager.registerNode({
      id: 'node-1',
      host: '192.168.1.69',
      port: 50051,
      capabilities: ['state-sync'],
      status: 'online'
    });
    stateManager.registerNode({
      id: 'node-2',
      host: '192.168.1.70',
      port: 50052,
      capabilities: ['metrics'],
      status: 'online'
    });
    stateManager.registerNode({
      id: 'node-1', // 当前节点
      host: 'localhost',
      port: 50051,
      capabilities: ['state-sync', 'metrics'],
      status: 'online'
    });
    const nodes = stateManager.listNodes();
    expect(nodes).toHaveLength(3); // 包括自己
    expect(nodes.find(n => n.id === 'node-1')).toBeDefined();
    expect(nodes.find(n => n.id === 'node-2')).toBeDefined();
  });

  it('should handle node unregistration', () => {
    stateManager.registerNode({
      id: 'node-1',
      host: '192.168.1.69',
      port: 50051,
      capabilities: ['state-sync'],
      status: 'online'
    });
    stateManager.registerNode({
      id: 'node-2',
      host: '192.168.1.70',
      port: 50052,
      capabilities: ['metrics'],
      status: 'online'
    });
    stateManager.registerNode({
      id: 'node-1', // 当前节点
      host: 'localhost',
      port: 50051,
      capabilities: ['state-sync', 'metrics'],
      status: 'online'
    });
    stateManager.unregisterNode('node-2');
    const nodes = stateManager.listNodes();
    expect(nodes).toHaveLength(2); // 只有自己和node-1
    expect(nodes.find(n => n.id === 'node-1')).toBeDefined();
  });
});
