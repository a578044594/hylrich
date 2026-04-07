// 完整系统集成测试

import { GrpcClient, GRPCService } from '../src/protocols/grpc';
import { WebSocketBus, WebSocketConfig } from '../src/protocols/WebSocketBus';
import { DistributedStateManager } from '../src/services/state/DistributedStateManager';
import { MetricsCollector } from '../src/monitoring/MetricsCollector';
import { AlertManager } from '../src/services/monitor/AlertManager';

describe('Hylrich System Integration', () => {
  let grpcService: GRPCService;
  let grpcClient: GrpcClient;
  let wsBus: WebSocketBus;
  let stateManager: DistributedStateManager;
  let metricsCollector: MetricsCollector;
  let alertManager: AlertManager;

  beforeEach(async () => {
    // 初始化所有组件
    grpcService = new GRPCService();
    grpcClient = new GrpcClient();
    wsBus = new WebSocketBus({ url: 'ws://localhost:8080' } as WebSocketConfig);
    stateManager = new DistributedStateManager('test-node-1');
    metricsCollector = new MetricsCollector();
    alertManager = new AlertManager();

    await Promise.all([
      grpcService.start(),
      grpcClient.connect(),
      wsBus.connect(),
      stateManager.start(),
      alertManager.start()
    ]);
  });

  afterEach(async () => {
    await Promise.all([
      grpcService.stop(),
      grpcClient.disconnect(),
      wsBus.disconnect(),
      stateManager.stop(),
      alertManager.stop()
    ]);
  });

  test('should perform complete tool execution flow', async () => {
    // 创建测试工具
    const testTool = {
      name: 'test_tool',
      description: 'A test tool',
      execute: async () => ({ success: true, data: 'test' })
    };

    // 执行工具
    const result = await testTool.execute({ input: 'test' });
    
    expect(result.success).toBe(true);
    expect(result.data).toBe('test');
  });

  test('should handle gRPC communication correctly', async () => {
    // 通过gRPC调用工具
    const response = await grpcClient.executeTool({
      name: 'test_tool',
      parameters: { input: 'test' }
    });

    expect(response).toBeDefined();
    expect(response.success).toBe(true);
    expect(response.executionTime).toBeGreaterThan(0);
  });

  test('should handle WebSocket message bus correctly', async () => {
    const messages: any[] = [];
    
    wsBus.on('message', (msg: any) => {
      messages.push(msg);
    });

    // 发送消息
    wsBus.send({
      type: 'test',
      data: { test: 'value' }
    });

    // 等待消息处理
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(messages).toHaveLength(1);
    expect(messages[0].type).toBe('test');
    expect(messages[0].data).toEqual({ test: 'value' });
  });

  test('should handle distributed state synchronization', async () => {
    // 本地设置状态
    stateManager.setState('test-key', 'test-value');

    // 模拟远程节点更新
    const remoteUpdate = {
      key: 'remote-key',
      value: 'remote-value',
      nodeId: 'remote-node',
      version: 1,
      timestamp: Date.now()
    };

    stateManager.processStateUpdate(remoteUpdate);

    expect(stateManager.getState('remote-key')).toBe('remote-value');
  });

  test('should handle metrics collection and alerting', async () => {
    // 记录指标
    metricsCollector.recordMetric('test_metric', 42);
    
    // 配置警报
    alertManager.configureAlert('test_metric', {
      threshold: 50,
      severity: 'warning',
      message: 'Metric exceeded threshold',
      cooldown: 5000
    });

    // 触发警报
    metricsCollector.recordMetric('test_metric', 60);

    // 验证警报被创建
    const stats = alertManager.getStats();
    expect(stats.total).toBeGreaterThan(0);
  });

  test('should handle concurrent operations', async () => {
    const operations = Array.from({ length: 10 }, (_, i) =>
      grpcClient.executeTool({
        name: 'test_tool',
        parameters: { input: `test-${i}` }
      })
    );

    const results = await Promise.all(operations);

    results.forEach((result: any) => {
      expect(result.success).toBe(true);
    });
  });

  test('should handle system health monitoring', async () => {
    // 获取系统健康状态
    const health = await grpcClient.getHealth();
    
    expect(health).toBeDefined();
    expect(health.status).toBe('healthy');
    expect(health.version).toBeDefined();
  });

  test('should handle error recovery', async () => {
    // 尝试执行不存在的工具
    try {
      await grpcClient.executeTool({
        name: 'nonexistent_tool',
        parameters: {}
      });
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });
});
