import { GrpcClient } from './GrpcClient';

export class GrpcProtocol {
  private client: GrpcClient;
  private _isRunning: boolean;

  constructor(target?: string) {
    this.client = new GrpcClient(target);
    this._isRunning = false;
  }

  public get isRunning(): boolean {
    return this._isRunning;
  }

  public async start(): Promise<void> {
    if (this._isRunning) {
      console.log('⚠️ gRPC协议已在运行');
      return;
    }

    try {
      await this.client.connect();
      this._isRunning = true;
      console.log('🚀 gRPC协议已启动');
    } catch (error) {
      console.error('❌ gRPC协议启动失败:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    if (!this._isRunning) {
      console.log('⚠️ gRPC协议未运行');
      return;
    }

    try {
      await this.client.disconnect();
      this._isRunning = false;
      console.log('🛑 gRPC协议已停止');
    } catch (error) {
      console.error('❌ gRPC协议停止失败:', error);
      throw error;
    }
  }

  public async executeTool(toolName: string, input: any): Promise<any> {
    if (!this._isRunning) {
      throw new Error('gRPC协议未运行');
    }

    return await this.client.executeTool(toolName, input);
  }

  public async healthCheck(): Promise<any> {
    if (!this._isRunning) {
      throw new Error('gRPC协议未运行');
    }

    return await this.client.healthCheck();
  }

  public async getMetrics(): Promise<any> {
    if (!this._isRunning) {
      throw new Error('gRPC协议未运行');
    }

    return await this.client.getMetrics();
  }

  public async getSystemStats(): Promise<any> {
    if (!this._isRunning) {
      throw new Error('gRPC协议未运行');
    }

    return await this.client.getSystemStats();
  }
}
