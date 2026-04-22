import { EventEmitter } from 'events';

export interface StateSnapshot {
  timestamp: number;
  data: any;
}

export class StateSyncService extends EventEmitter {
  private states: Map<string, any> = new Map();

  constructor() {
    super();
  }

  public async start(): Promise<void> {
    console.log('🔄 状态同步服务启动（无gRPC依赖）');
  }

  public async stop(): Promise<void> {
    console.log('🔄 状态同步服务停止');
  }

  public async saveState(key: string, value: any): Promise<void> {
    this.states.set(key, value);
  }

  public async loadState(key: string): Promise<any> {
    return this.states.get(key);
  }

  public async getAllStates(): Promise<Map<string, any>> {
    return this.states;
  }
}
