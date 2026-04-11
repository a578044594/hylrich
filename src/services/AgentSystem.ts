import { EventEmitter } from '../core/EventEmitter';
import { WebSocketBus } from '../protocols/WebSocketBus';
import { GrpcProtocol } from '../protocols/grpc/GrpcProtocol';
import { EnhancedMCPTool } from '../protocols/EnhancedMCPTool';

export interface AgentSystemConfig {
  webSocketUrl?: string;
  grpcPort?: number;
}

export class AgentSystem extends EventEmitter {
  private webSocketBus?: WebSocketBus;
  private grpcProtocol?: GrpcProtocol;
  private mcpTool?: EnhancedMCPTool;
  private isRunning = false;

  constructor(private config: AgentSystemConfig = {}) {
    super();
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('AgentSystem is already running');
    }

    this.isRunning = true;
    
    // 初始化WebSocket总线
    if (this.config.webSocketUrl) {
      this.webSocketBus = new WebSocketBus({
        url: this.config.webSocketUrl
      });
      
      await this.webSocketBus.connect();
      this.webSocketBus.on('message', (message) => {
        this.handleWebSocketMessage(message);
      });
    }

    // 初始化gRPC协议
    if (this.config.grpcPort) {
      this.grpcProtocol = new GrpcProtocol({
        port: this.config.grpcPort
      });
      await this.grpcProtocol.start();
    }

    // 初始化MCP工具
    this.mcpTool = new EnhancedMCPTool();

    this.emit('started');
    console.log('AgentSystem started successfully');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.webSocketBus) {
      this.webSocketBus.disconnect();
    }
    
    if (this.grpcProtocol) {
      await this.grpcProtocol.stop();
    }

    this.emit('stopped');
    console.log('AgentSystem stopped');
  }

  private handleWebSocketMessage(message: any): void {
    // 处理WebSocket消息
    this.emit('websocket_message', message);
  }

  getStatus(): {
    running: boolean;
    webSocketConnected: boolean;
    grpcRunning: boolean;
  } {
    return {
      running: this.isRunning,
      webSocketConnected: this.webSocketBus?.getConnectionStatus().connected || false,
      grpcRunning: this.grpcProtocol?.isRunning() || false
    };
  }

  async executeTool(toolName: string, input: any): Promise<any> {
    if (!this.isRunning) {
      throw new Error('AgentSystem is not running');
    }

    // 这里可以实现工具执行逻辑
    // 暂时返回模拟结果
    return {
      success: true,
      result: `Tool ${toolName} executed successfully`,
      timestamp: Date.now()
    };
  }
}
