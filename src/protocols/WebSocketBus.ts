import WebSocket from "ws";

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export class WebSocketBus {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private messageQueue: any[] = [];
  private isConnected = false;
  
  constructor(private config: WebSocketConfig) {
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      ...config
    };
  }
  
  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url);
        
        this.ws.on("open", () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.processMessageQueue();
          this.startHeartbeat();
          resolve();
        });
        
        this.ws.on("close", () => {
          this.isConnected = false;
          this.handleReconnect();
        });
        
        this.ws.on("error", (error) => {
          reject(error);
        });
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  public send(message: any): void {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }
  
  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }
  
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.config.maxReconnectAttempts!) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect().catch(console.error);
      }, this.config.reconnectInterval!);
    }
  }
  
  private startHeartbeat(): void {
    setInterval(() => {
      if (this.isConnected) {
        this.send({ type: "heartbeat", timestamp: Date.now() });
      }
    }, this.config.heartbeatInterval!);
  }
  
  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
    // 清空消息队列
    this.messageQueue = [];
  }
}
