import { WebSocket, WebSocketServer } from 'ws';
import { Tool } from '../../core/Tool';

export class WebSocketBus {
  private server: WebSocketServer | null = null;
  private clients: Map<string, WebSocket> = new Map();
  private _isRunning: boolean = false;

  constructor(private port: number = 8080) {}

  public get isRunning(): boolean {
    return this._isRunning;
  }

  public async start(): Promise<void> {
    if (this._isRunning) {
      console.log('⚠️ WebSocket总线已在运行');
      return;
    }

    this.server = new WebSocketServer({ port: this.port });
    this.server.on('connection', (ws: WebSocket) => {
      console.log('🔌 新客户端连接');
      const clientId = Date.now().toString() + Math.random().toString(36).substr(2, 9); // 生成唯一ID
      this.clients.set(clientId, ws);
      
      ws.on('message', (message: string) => {
        console.log('📥 接收消息:', message);
        // 可以在这里实现消息处理逻辑
      });
      
      ws.on('close', () => {
        console.log('🔌 客户端断开连接');
        this.clients.delete(clientId);
      });
    });

    this._isRunning = true;
    console.log(`🚀 WebSocket总线启动在端口 ${this.port}`);
  }

  public async stop(): Promise<void> {
    if (!this._isRunning) {
      console.log('⚠️ WebSocket总线未运行');
      return;
    }

    if (this.server) {
      this.server.close();
    }
    this.clients.clear();
    this._isRunning = false;
    console.log('🛑 WebSocket总线已停止');
  }

  public async send(message: any): Promise<void> {
    if (!this._isRunning) {
      throw new Error('WebSocket总线未运行');
    }

    const data = JSON.stringify(message);
    for (const [clientId, client] of this.clients.entries()) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  public async broadcast(message: any): Promise<void> {
    if (!this._isRunning) {
      throw new Error('WebSocket总线未运行');
    }

    const data = JSON.stringify(message);
    this.server?.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }
}
