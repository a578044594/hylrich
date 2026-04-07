import { GrpcClient } from '../src/protocols/grpc/GrpcClient';

// Mock gRPC相关模块
jest.mock('@grpc/grpc-js', () => ({
  loadPackageDefinition: jest.fn().mockReturnValue({
    openclaw: {
      agent: {
        AgentService: jest.fn().mockImplementation(() => ({
          ExecuteTool: jest.fn((request: any, callback: any) => {
            callback(null, {
              success: true,
              result_data: Buffer.from(JSON.stringify({ result: 'test result' }))
            });
          }),
          GetSystemHealth: jest.fn((request: any, callback: any) => {
            callback(null, { status: 'healthy', uptime: 1000 });
          }),
          StreamMetrics: jest.fn().mockReturnValue({
            on: jest.fn((event: string, handler: Function) => {
              if (event === 'data') {
                setTimeout(() => handler({ metric: 'test', value: 100 }), 100);
              }
              return {
                on: jest.fn(),
                cancel: jest.fn()
              };
            }),
            cancel: jest.fn()
          })
        }))
      }
    }
  }),
  credentials: {
    createInsecure: jest.fn().mockReturnValue('insecure-credentials')
  },
  closeClient: jest.fn()
}));

jest.mock('@grpc/proto-loader', () => ({
  loadSync: jest.fn().mockReturnValue({
    openclaw: {
      agent: {
        AgentService: {
          service: {}
        }
      }
    }
  })
}));

describe('GrpcClient', () => {
  let grpcClient: GrpcClient;

  beforeEach(() => {
    grpcClient = new GrpcClient({
      host: 'localhost',
      port: 50051
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('应该正确创建Grpc客户端', () => {
    expect(grpcClient).toBeInstanceOf(GrpcClient);
    expect(grpcClient['config'].host).toBe('localhost');
    expect(grpcClient['config'].port).toBe(50051);
  });

  test('应该设置客户端连接', () => {
    expect(grpcClient['client']).toBeDefined();
  });

  test('应该成功执行工具', async () => {
    const result = await grpcClient.executeTool('test_tool', { input: 'test' });
    
    expect(result).toEqual({ result: 'test result' });
    expect(grpcClient['client'].ExecuteTool).toHaveBeenCalledWith(
      {
        tool_name: 'test_tool',
        input_data: expect.any(Buffer)
      },
      expect.any(Function)
    );
  });

  test('应该处理工具执行错误', async () => {
    // 模拟执行错误
    grpcClient['client'].ExecuteTool.mockImplementation((request: any, callback: any) => {
      callback(new Error('Execution failed'), null);
    });
    
    await expect(grpcClient.executeTool('test_tool', {})).rejects.toThrow('Execution failed');
  });

  test('应该获取系统健康状态', async () => {
    const health = await grpcClient.getSystemHealth();
    
    expect(health).toEqual({ status: 'healthy', uptime: 1000 });
    expect(grpcClient['client'].GetSystemHealth).toHaveBeenCalled();
  });

  test('应该处理健康检查错误', async () => {
    // 模拟健康检查错误
    grpcClient['client'].GetSystemHealth.mockImplementation((request: any, callback: any) => {
      callback(new Error('Health check failed'), null);
    });
    
    await expect(grpcClient.getSystemHealth()).rejects.toThrow('Health check failed');
  });

  test('应该流式传输指标', (done) => {
    const callback = jest.fn((metrics) => {
      expect(metrics).toEqual({ metric: 'test', value: 100 });
      done();
    });
    
    const cancel = grpcClient.streamMetrics(1000, callback);
    expect(cancel).toBeDefined();
  });

  test('应该关闭客户端连接', () => {
    grpcClient.close();
    expect(require('@grpc/grpc-js').closeClient).toHaveBeenCalledWith(grpcClient['client']);
  });
});
