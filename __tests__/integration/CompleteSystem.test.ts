// 完整系统集成测试

import { Tool } from '../../src/core/Tool';
import { WebSocketBus } from '../../src/protocols/websocket/WebSocketBus';
import { GRPCService } from '../../src/protocols/grpc/GRPCService';
import { GrpcClient } from '../../src/protocols/grpc/GrpcClient';
import { FileReadTool } from '../../src/tools/FileReadTool';
import { FileWriteTool } from '../../src/tools/FileWriteTool';
import { EnhancedMCPTool } from '../../src/tools/EnhancedMCPTool';

describe('Complete System Integration', () => {
  let webSocketBus: WebSocketBus;
  let grpcService: GRPCService;
  let grpcClient: GrpcClient;
  let fileReadTool: FileReadTool;
  let fileWriteTool: FileWriteTool;
  let mcpTool: EnhancedMCPTool;

  beforeEach(() => {
    // 初始化WebSocket消息总线
    webSocketBus = new WebSocketBus({
      host: 'localhost',
      port: 8080,
      maxReconnectAttempts: 3,
      reconnectInterval: 1000
    });

    // 初始化gRPC服务
    grpcService = new GRPCService({
      port: 50051,
      enableMetrics: true,
      enableHealthChecks: true
    });

    // 初始化gRPC客户端
    grpcClient = new GrpcClient({
      host: 'localhost',
      port: 50051,
      timeout: 5000
    });

    // 初始化工具
    fileReadTool = new FileReadTool();
    fileWriteTool = new FileWriteTool();
    mcpTool = new EnhancedMCPTool();

    console.log('Complete system initialized');
  });

  afterEach(() => {
    // 清理资源
    webSocketBus.disconnect();
    grpcService.stop();
    grpcClient.disconnect();
  });

  test('should perform complete tool execution flow', async () => {
    // 测试文件读写工具
    const testContent = 'Hello, World!';
    
    // 写入文件
    const writeResult = await fileWriteTool.execute({
      path: 'test.txt',
      content: testContent
    });
    
    expect(writeResult.success).toBe(true);
    expect(writeResult.path).toBe('test.txt');

    // 读取文件
    const readResult = await fileReadTool.execute({
      path: 'test.txt'
    });
    
    expect(readResult.success).toBe(true);
    expect(readResult.content).toBe(testContent);

    // 测试MCP工具
    const mcpResult = await mcpTool.execute({
      tool_name: 'test_tool',
      parameters: { test: 'value' }
    });
    
    expect(mcpResult.success).toBe(true);
    expect(mcpResult.result).toBeDefined();

    console.log('Complete tool execution flow passed');
  });

  test('should handle WebSocket communication', async () => {
    // 测试WebSocket消息发送
    const message = {
      type: 'test_message',
      data: { value: 42 }
    };

    const sendResult = await webSocketBus.send(message);
    expect(sendResult.success).toBe(true);

    console.log('WebSocket communication test passed');
  };);

  test('should handle gRPC tool execution', async () => {
    // 测试gRPC工具执行
    const toolRequest = {
      tool_name: 'file_read',
      parameters: { path: 'test.txt' }
    };

    const result = await grpcClient.executeTool(toolRequest);
    expect(result.success).toBe(true);
    expect(result.result).toBeDefined();

    console.log('gRPC tool execution test passed');
  });

  test('should handle health checks', async () => {
    // 测试健康检查
    const health = await grpcClient.checkHealth();
    expect(health.status).toBe('SERVING');
    expect(health.services).toContain('agent');

    console.log('Health check test passed');
  });

  test('should handle performance metrics', async () => {
    // 测试性能指标收集
    const metrics = await grpcClient.getMetrics('tool_execution_time');
    expect(metrics).toBeDefined();
    expect(Array.isArray(metrics)).toBe(true);

    console.log('Performance metrics test passed');
  });

  test('should handle error scenarios', async () => {
    // 测试错误处理
    const invalidRequest = {
      tool_name: 'invalid_tool',
      parameters: {}
    };

    const result = await grpcClient.executeTool(invalidRequest);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();

    console.log('Error handling test passed');
  });

  test('should support real-time monitoring', async () => {
    // 测试实时监控
    const monitor = grpcClient.monitorMetrics((metric) => {
      console.log('Real-time metric:', metric);
    });

    // 执行一些操作来生成指标
    await fileReadTool.execute({ path: 'test.txt' });
    
    // 等待一下让指标生成
    await new Promise(resolve => setTimeout(resolve, 100));
    
    monitor.stop();

    console.log('Real-time monitoring test passed');
  });

  test('should handle concurrent operations', async () => {
    // 测试并发操作
    const concurrentRequests = Array(5).fill(0).map((_, i) =>
      fileReadTool.execute({ path: 'test.txt' })
    );

    const results = await Promise.all(concurrentRequests);
    
    results.forEach(result => {
      expect(result.success).toBe(true);
      expect(result.content).toBe('Hello, World!');
    });

    console.log('Concurrent operations test passed');
  });

  test('should provide system statistics', async () => {
    // 测试系统统计
    const stats = await grpcClient.getSystemStats();
    
    expect(stats).toBeDefined();
    expect(stats.totalTools).toBeGreaterThan(0);
    expect(stats.activeConnections).toBeDefined();
    expect(stats.memoryUsage).toBeDefined();

    console.log('System statistics test passed');
  });
});
