import { GrpcProtocol } from '../protocols/grpc/GrpcProtocol';
import { WebSocketBus } from '../protocols/websocket/WebSocketBus';

export class AgentSystem {
  private grpcProtocol: GrpcProtocol;
  private websocketBus: WebSocketBus;

  constructor() {
    this.grpcProtocol = new GrpcProtocol();
    this.websocketBus = new WebSocketBus();
  }

  public async start(): Promise<void> {
    console.log('🚀 启动Agent系统...');
    
    // 启动gRPC协议
    await this.grpcProtocol.start();
    
    // 启动WebSocket消息总线
    await this.websocketBus.start();
    
    console.log('✅ Agent系统启动完成');
  }

  public async stop(): Promise<void> {
    console.log('🛑 停止Agent系统...');
    
    await this.grpcProtocol.stop();
    await this.websocketBus.stop();
    
    console.log('✅ Agent系统已停止');
  }

  public async sendMessage(message: any): Promise<void> {
    console.log('📨 发送消息:', message);
    // 通过WebSocket总线发送消息
    await this.websocketBus.send(message);
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
    websocketRunning: boolean;
  } {
    return {
      grpcRunning: this.grpcProtocol.isRunning,
      websocketRunning: this.websocketBus.isRunning
    };
  }
}
