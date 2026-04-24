import { Server, ServerCredentials, loadPackageDefinition } from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';
import * as os from 'os';
import { DistributedStateStore } from '../../state/DistributedStateStore';
import { StateChangeEvent } from '../../state/DistributedStateStore';

export interface GRPCServiceConfig {
  port: number;
  protoPath?: string;
  stateStore?: DistributedStateStore;
  toolExecutor?: (toolName: string, input: any) => Promise<any>;
}

export class GRPCService {
  private server: Server;
  private config: GRPCServiceConfig;
  private stateStore?: DistributedStateStore;
  private toolExecutor?: (toolName: string, input: any) => Promise<any>;
  private toolExecutionCount = 0;
  private toolErrorCount = 0;
  private totalExecutionTimeMs = 0;
  
  constructor(config: GRPCServiceConfig) {
    this.config = config;
    this.stateStore = config.stateStore;
    this.toolExecutor = config.toolExecutor;
    this.server = new Server();
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
      oneofs: true
    });
    
    const proto = loadPackageDefinition(packageDefinition) as any;
    
    const agentPackage = proto.openclaw?.agent;
    if (!agentPackage || !agentPackage.AgentService) {
      throw new Error('Failed to load AgentService from proto definition');
    }
    
    // Cast implementation to any to bypass strict overload checking
    const impl: any = {
      ExecuteTool: this.executeTool.bind(this),
      GetSystemHealth: this.getSystemHealth.bind(this),
      StreamMetrics: this.streamMetrics.bind(this),
      StreamStateUpdates: this.streamStateUpdates.bind(this),
      PublishState: this.publishState.bind(this),
      GetCurrentState: this.getCurrentState.bind(this)
    };
    
    this.server.addService(agentPackage.AgentService.service, impl);
    
    console.log('gRPC services with StateSync setup completed');
  }
  
  private executeTool(call: any, callback: any) {
    const { tool_name, input_data } = call.request;
    
    try {
      const input = JSON.parse(input_data.toString('utf8'));
      const start = Date.now();

      if (!this.toolExecutor) {
        callback(null, {
          success: false,
          result_data: Buffer.alloc(0),
          error_message: 'No tool executor configured',
          execution_time_ms: Date.now() - start
        });
        return;
      }

      this.toolExecutor(tool_name, input)
        .then((result: any) => {
          const executionTime = Date.now() - start;
          this.toolExecutionCount += 1;
          this.totalExecutionTimeMs += executionTime;
          callback(null, {
            success: true,
            result_data: Buffer.from(JSON.stringify(result ?? {})),
            execution_time_ms: executionTime
          });
        })
        .catch((error: any) => {
          const executionTime = Date.now() - start;
          this.toolExecutionCount += 1;
          this.toolErrorCount += 1;
          this.totalExecutionTimeMs += executionTime;
          callback(null, {
            success: false,
            result_data: Buffer.alloc(0),
            error_message: error?.message || String(error),
            execution_time_ms: executionTime
          });
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
  
  private getSystemHealth(call: any, callback: any) {
    const healthData = {
      timestamp: Date.now(),
      tool_count: this.toolExecutionCount,
      active_agents: this.stateStore ? 1 : 0,
      status: 'healthy'
    };
    callback(null, healthData);
  }
  
  private streamMetrics(call: any, send: any) {
    const { interval_ms } = call.request;
    const interval = interval_ms || 1000;
    let previousToolExecutions = this.toolExecutionCount;
    
    const timer = setInterval(() => {
      if (call.cancelled) {
        clearInterval(timer);
        return;
      }

      const currentExecutions = this.toolExecutionCount;
      const executedSinceLastTick = currentExecutions - previousToolExecutions;
      previousToolExecutions = currentExecutions;
      
      const metrics = {
        cpu_usage: (os.loadavg()[0] / Math.max(1, os.cpus().length)) * 100,
        memory_usage_mb: process.memoryUsage().heapUsed / 1024 / 1024,
        message_throughput: Math.max(0, Math.floor((executedSinceLastTick * 1000) / interval))
      };
      
      send.write(metrics);
    }, interval);
    
    call.on('cancelled', () => {
      clearInterval(timer);
    });
  }

  /**
   * 流式状态更新
   */
  private streamStateUpdates(call: any, send: any) {
    const request = call.request;
    const { client_id, filter_prefix } = request;
    
    console.log(`[StateSync] Stream started for client ${client_id}`);
    
    // 发送当前快照
    if (this.stateStore) {
      const snapshot = this.stateStore.snapshot(filter_prefix || '');
      for (const [key, value] of Object.entries(snapshot)) {
        if (call.cancelled) break;
        send.write({
          key,
          value: Buffer.from(JSON.stringify(value) || ''),
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
        
        const { filter_prefix: prefix } = request;
        if (prefix && !event.payload.key.startsWith(prefix)) {
          return;
        }
        
        const update = {
          key: event.payload.key,
          value: Buffer.from(JSON.stringify(event.payload.value) || ''),
          operation: event.payload.operation,
          timestamp: event.payload.timestamp,
          source: event.payload.source || 'unknown'
        };
        
        send.write(update);
      });
    }
    
    call.on('cancelled', () => {
      console.log(`[StateSync] Stream cancelled for client ${client_id}`);
      if (unsubscribe) unsubscribe();
    });
  }

  /**
   * 发布状态变更
   */
  private publishState(call: any, callback: any) {
    const { key, value, source, timestamp } = call.request;
    
    try {
      const valueJson = value ? JSON.parse(value.toString('utf8')) : null;
      
      if (this.stateStore) {
        if (valueJson !== null) {
          this.stateStore.applyReplicaState(key, valueJson, 'set', timestamp);
        } else {
          this.stateStore.applyReplicaState(key, null, 'delete', timestamp);
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
  private getCurrentState(call: any, callback: any) {
    const { filter_prefix } = call.request;
    
    try {
      const snapshot = this.stateStore ? this.stateStore.snapshot(filter_prefix) : {};
      
      // 将值序列化为 Buffer
      const serializedSnapshot: Record<string, Buffer> = {};
      for (const [key, value] of Object.entries(snapshot)) {
        serializedSnapshot[key] = Buffer.from(JSON.stringify(value) || '');
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
        ServerCredentials.createInsecure(),
        (error: Error | null, port: number) => {
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
    return new Promise((resolve) => {
      this.server.tryShutdown(() => resolve());
    });
  }
}
