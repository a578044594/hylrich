import { GRPCService } from '../src/protocols/grpc/GRPCService';

// Mock gRPC相关模块
jest.mock('@grpc/grpc-js', () => ({
  Server: jest.fn().mockImplementation(() => ({
    addService: jest.fn(),
    bindAsync: jest.fn((address, credentials, callback) => callback(null, 50051)),
    start: jest.fn(),
    forceShutdown: jest.fn(),
    tryShutdown: jest.fn((callback) => callback())
  })),
  loadPackageDefinition: jest.fn().mockReturnValue({
    openclaw: {
      agent: {
        AgentService: {
          service: {}
        }
      }
    }
  }),
  ServerCredentials: {
    createInsecure: jest.fn().mockReturnValue('insecure-credentials')
  }
}));

jest.mock('@grpc/proto-loader', () => ({
  loadSync: jest.fn().mockReturnValue({
    agent: {
      AgentService: {
        service: {}
      }
    }
  })
}));

describe('GRPCService', () => {
  let grpcService: GRPCService;

  beforeEach(() => {
    grpcService = new GRPCService({
      port: 50051,
      protoPath: '../protos/agent.proto'
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('应该正确创建GRPC服务', () => {
    expect(grpcService).toBeInstanceOf(GRPCService);
    expect(grpcService['config'].port).toBe(50051);
    expect(grpcService['config'].protoPath).toBe('../protos/agent.proto');
  });

  test('应该初始化工具和监控收集器', () => {
    expect(grpcService['fileReadTool']).toBeDefined();
    expect(grpcService['metricsCollector']).toBeDefined();
  });

  test('应该设置服务', () => {
    // 检查是否调用了setupServices
    expect(grpcService['server'].addService).toHaveBeenCalled();
  });

  test('启动服务应该调用server.start', async () => {
    await grpcService.start();
    expect(grpcService['server'].bindAsync).toHaveBeenCalledWith(
      '0.0.0.0:50051',
      'insecure-credentials',
      expect.any(Function)
    );
  });

  test('停止服务应该调用server.tryShutdown', async () => {
    await grpcService.stop();
    expect(grpcService['server'].tryShutdown).toHaveBeenCalled();
  });
});
