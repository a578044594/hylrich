import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';
import { DistributedStateStore } from '../../state/DistributedStateStore';
import { StateChangeEvent } from '../../state/DistributedStateStore';

export interface GRPCServiceConfig {
  port: number;
  protoPath?: string;
  stateStore?: DistributedStateStore;
}

export class GRPCService {
  private server: grpc.Server;
  private config: GRPCServiceConfig;
  private stateStore?: DistributedStateStore;
  
  constructor(config: GRPCServiceConfig) {
    this.config = config;
    this.stateStore = config.stateStore;
    this.server = new grpc.Server();
    this.setupServices();
  }
  
  private setupServices() {
    let protoPath = this.config.protoPath || join(__dirname, '../protos/agent.proto');
    if (!require('fs').existsSync(protoPath)) {
      protoPath = join(__dirname, '../../protos/agent.proto');
    }
    
    const packageDefinition = protoLoader.loadSync(protoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    });
    
    const proto = grpc.loadPackageDefinition(packageDefinition) as any;
    
    const agentPackage = proto.openclaw?.agent;
    if (!agentPackage || !agentPackage.AgentService) {
      throw new Error('Failed to load AgentService from proto definition');
    }
    
    this.server.addService(
      agentPackage.AgentService.service,
      {
        ExecuteTool: this.executeTool.bind(this),
        GetSystemHealth: this.getSystemHealth.bind(this),
        StreamMetrics: this.streamMetrics.bind(this),
        StreamStateUpdates: this.streamStateUpdates.bind(this),
        PublishState: this.publishState.bind(this),
        GetCurrentState: this.getCurrentState.bind(this)
      }
    );
    
    console.log('gRPC services with StateSync setup completed');
  }
  
  private executeTool(call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) {
    const { tool_name, input_data } = call.request;
    
    try {
      const input = JSON.parse(input_data.toString());
      // 这里应该调用真正的工具注册表
      const result = { 
        success: true, 
        result_data: JSON.stringify({ output: `Mock result for ${tool_name}` }),
        execution_time_ms: 0 
      };
      callback(null, {
        success: true,
        result_data: Buffer.from(JSON.stringify(result)),
        execution_time_ms: 0
      });
    } catch (error: any) {
      callback(null, {
        success: false,
        result_data: Buffer.alloc(0),
        error_message: error.message,
        execution_time_ms: 0
      });
    }
  }
  
  private getSystemHealth(call: grpc.ServerUnaryCall<any>, callback: grpc.sendUnaryData<any>) {
    const healthData = {
      timestamp: Date.now(),
      tool_count: 0,
      active_agents: this.stateStore ? 1 : 0,
      status: 'healthy'
    };
    callback(null, healthData);
  }
  
  private streamMetrics(call: grpc.ServerWritableStream<any>) {
    const { interval_ms } = call.request as any;
    const interval = interval_ms || 1000;
    
    const timer = setInterval(() => {
      if (call.cancelled) {
        clearInterval(timer);
        return;
      }
      
      const metrics = {
        cpu_usage: Math.random() * 10,
        memory_usage_mb: process.memoryUsage().heapUsed / 1024 / 1024,
        message_throughput: Math.floor(Math.random() * 100)
      };
      
      call.write(metrics);
    }, interval);
    
    call.on('cancelled', () => {
      clearInterval(timer);
    });
  }

  /**
   * 流式状态更新 - 客户端订阅状态变更
   * 实现：客户端发起流，服务端推送状态变更
   */
  private streamStateUpdates(call: grpc.ServerReadableStream<any>, callback: grpc.sendUnaryData<any>) {
    const request = call.request as any;
    const { client_id, filter_prefix } = request;
    
    console.log(`[StateSync] Stream started for client ${client_id}`);
    
    // 发送当前快照
    if (this.stateStore) {
      const snapshot = this.stateStore.snapshot(filter_prefix || '');
      for (const [key, value] of Object.entries(snapshot)) {
        if (call.cancelled) break;
        call.write({
          key,
          value: Buffer.from(JSON.stringify(value)),
          operation: 'set',
          timestamp: Date.now(),
          source: 'snapshot'
        });
      }
    }
    
    // 订阅后续变更
    let unsubscribe: (() => void) | undefined;
    if (this.stateStore) {
      unsubscribe = this.stateStore.subscribe((event: StateChangeEvent) => {
        if (call.cancelled) {
          if (unsubscribe) unsubscribe();
          return;
        }
        
        const { prefix } = request;
        if (prefix && !event.payload.key.startsWith(prefix)) {
          return;
        }
        
        const update = {
          key: event.payload.key,
          value: Buffer.from(JSON.stringify(event.payload.value)),
          operation: event.payload.operation,
          timestamp: event.payload.timestamp,
          source: event.payload.source || 'unknown'
        };
        
        call.write(update);
      });
    }
    
    call.on('cancelled', () => {
      console.log(`[StateSync] Stream cancelled for client ${client_id}`);
      if (unsubscribe) unsubscribe();
    });
  }

  /**
   * 发布状态变更 - 客户端发送状态更新
   * 实现：客户端发送单个状态更新，服务端合并到本地状态并转发
   */
  private publishState(call: grpc.ServerUnaryCall<any>, callback: grpc.sendUnaryData<any>) {
    const { key, value, source, timestamp } = call.request;
    
    try {
      const valueJson = value ? JSON.parse(value.toString()) : null;
      
      if (this.stateStore) {
        const localStore = this.stateStore as any;
        // 使用内部方法直接更新状态，避免再次 gRPC 广播
        if (valueJson !== null) {
          localStore._internalSet?.(key, valueJson, false);
        } else {
          localStore._internalDelete?.(key, false);
        }
      }
      
      callback(null, { accepted: true });
    } catch (error: any) {
      console.error(`[StateSync] Publish error: ${error.message}`);
      callback(null, { accepted: false, error: error.message });
    }
  }

  /**
   * 获取当前状态快照
   */
  private getCurrentState(call: grpc.ServerUnaryCall<any>, callback: grpc.sendUnaryData<any>) {
    const { filter_prefix } = call.request as any;
    
    try {
      const snapshot = this.stateStore ? this.stateStore.snapshot(filter_prefix) : {};
      
      // 将值序列化为 Buffer
      const serializedSnapshot: Record<string, Buffer> = {};
      for (const [key, value] of Object.entries(snapshot)) {
        serializedSnapshot[key] = Buffer.from(JSON.stringify(value));
      }
      
      callback(null, {
        state: serializedSnapshot,
        timestamp: Date.now()
      });
    } catch (error: any) {
      console.error(`[StateSync] GetCurrentState error: ${error.message}`);
      callback(null, {
        state: {},
        timestamp: Date.now()
      });
    }
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.bindAsync(
        `0.0.0.0:${this.config.port}`,
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
          if (error) {
            reject(error);
          } else {
            console.log(`gRPC server started on port ${port}`);
            this.server.start();
            resolve();
          }
        }
      );
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.tryShutdown((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}
