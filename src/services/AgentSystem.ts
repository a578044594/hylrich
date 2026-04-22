import { GrpcProtocol } from '../protocols/grpc/GrpcProtocol';

export class AgentSystem {
  private grpcProtocol: GrpcProtocol;

  constructor() {
    this.grpcProtocol = new GrpcProtocol();
  }

  public async start(): Promise<void> {
    console.log('🚀 启动Agent系统...');
    
    try {
      await this.grpcProtocol.start();
    } catch (err) {
      console.warn('⚠️ gRPC启动失败，将以有限功能运行');
    }
    
    console.log('✅ Agent系统启动完成');
  }

  public async stop(): Promise<void> {
    console.log('🛑 停止Agent系统...');
    
    await this.grpcProtocol.stop();
    
    console.log('✅ Agent系统已停止');
  }

  public async sendMessage(message: any): Promise<void> {
    console.log('📨 发送消息:', message);
    // 不依赖WebSocket总线，直接处理
  }

  public async executeTool(toolName: string, input: any): Promise<any> {
    console.log(`🛠️ 执行工具: ${toolName}`);
    return await this.grpcProtocol.executeTool(toolName, input);
  }

  public async healthCheck(): Promise<any> {
    return await this.grpcProtocol.healthCheck();
  }

  public getStatus(): {
    grpcRunning: boolean;
  } {
    return {
      grpcRunning: this.grpcProtocol.isRunning
    };
  }
}
