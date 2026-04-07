import { GRPCService } from '../../src/protocols/grpc/GRPCService';

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
    openclaw: {
      agent: {
        AgentService: {
          service: {}
        }
      }
    }
  })
}));

// 端到端测试：GRPC服务
describe('端到端测试 - GRPC服务', () => {
  let grpcService: GRPCService;

  beforeEach(() => {
    grpcService = new GRPCService({
      port: 50051,
      protoPath: '../protos/agent.proto'
    });
  });

  afterEach(async () => {
    await grpcService.stop();
    jest.clearAllMocks();
  });

  test('应该成功启动gRPC服务', async () => {
    // 启动服务
    await grpcService.start();
    
    // 验证服务启动
    expect(grpcService['server'].bindAsync).toHaveBeenCalledWith(
      '0.0.0.0:50051',
      'insecure-credentials',
      expect.any(Function)
    );
    expect(grpcService['server'].start).toHaveBeenCalled();
  });

  test('应该正确处理服务停止', async () => {
    await grpcService.start();
    await grpcService.stop();
    
    expect(grpcService['server'].tryShutdown).toHaveBeenCalled();
  });

  test('应该初始化工具和监控收集器', () => {
    expect(grpcService['fileReadTool']).toBeDefined();
    expect(grpcService['metricsCollector']).toBeDefined();
  });
});
