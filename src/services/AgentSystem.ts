import { Agent, AgentConfig } from '../types/agent';
import { BaseAgent } from './BaseAgent';
import { ToolRegistry } from './ToolRegistry';
import { EventBus } from '../core/EventBus';
import { ContextManager } from './ContextManager';
import { Event } from '../types/events';
import { OpenAIAgent } from './OpenAIAgent';
import { FileWriteTool, FileReadTool } from '../tools/FileTools';
import { DistributedStateStore, StateChangeEvent } from '../state/DistributedStateStore';
import { GrpcClient } from '../protocols/grpc/GrpcClient';
import { GrpcServerService } from './GrpcServerService';

export interface AgentSystemOptions {
  autoStart?: boolean;
  grpcHost?: string;
  grpcPort?: number;
  grpcEnabled?: boolean;
}

export class AgentSystem {
  private agents: Map<string, BaseAgent> = new Map();
  public readonly toolRegistry: ToolRegistry;
  private eventBus: EventBus;
  private context: ContextManager;
  private stateStore: DistributedStateStore;
  private grpcClient?: GrpcClient;
  private grpcServer?: GrpcServerService;
  private nodeId: string;
  private grpcPort: number = 50051;
  private grpcHost: string = 'localhost';
  private grpcEnabled: boolean = true;
  private started = false;
  private remoteStateUnsubscribe?: () => void;
  private localStateUnsubscribe?: () => void;

  constructor(options?: AgentSystemOptions) {
    this.eventBus = new EventBus();
    this.context = new ContextManager();
    this.toolRegistry = new ToolRegistry();
    this.nodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.grpcPort = options?.grpcPort ?? this.grpcPort;
    this.grpcHost = options?.grpcHost ?? this.grpcHost;
    this.grpcEnabled = options?.grpcEnabled ?? true;
    
    // 初始化分布式状态存储
    this.stateStore = new DistributedStateStore({
      nodeId: this.nodeId,
      eventBus: this.eventBus
    });
    
    this.registerDefaultTools();

    if (options?.autoStart !== false) {
      void this.start();
    }
  }

  async start(): Promise<void> {
    if (this.started) {
      return;
    }
    this.started = true;

    // 监听状态变更，同步到全局
    this.localStateUnsubscribe = this.stateStore.subscribe((event: StateChangeEvent) => {
      this.handleStateChange(event);
    });

    if (!this.grpcEnabled) {
      return;
    }

    await this.initGrpcClient();
    this.grpcServer = new GrpcServerService(this.stateStore, this.eventBus, this.toolRegistry);
    await this.startGrpcServer();
  }

  async stop(): Promise<void> {
    this.remoteStateUnsubscribe?.();
    this.remoteStateUnsubscribe = undefined;
    this.localStateUnsubscribe?.();
    this.localStateUnsubscribe = undefined;
    this.grpcClient?.close();
    this.grpcClient = undefined;
    await this.grpcServer?.stop();
    this.grpcServer = undefined;
    this.started = false;
  }

  private async initGrpcClient(): Promise<void> {
    try {
      this.grpcClient = new GrpcClient({
        host: this.grpcHost,
        port: this.grpcPort
      });

      // 订阅远程状态更新
      this.remoteStateUnsubscribe = this.grpcClient.streamStateUpdates(
        (update: any) => {
          const value = update.value ? JSON.parse(update.value.toString()) : null;
          
          const event: StateChangeEvent = {
            type: 'state.changed',
            timestamp: update.timestamp,
            payload: {
              key: update.key,
              value: value,
              operation: update.operation,
              timestamp: update.timestamp,
              source: update.source
            }
          };
          
          // 处理远程状态变更
          this.stateStore.applyRemoteUpdate(event);
        }
      );

      console.log('gRPC state sync client initialized');
    } catch (error: any) {
      console.warn('Failed to initialize gRPC client:', error.message);
    }
  }

  private async startGrpcServer(): Promise<void> {
    try {
      await this.grpcServer!.start(this.grpcPort);
      console.log(`gRPC state sync server started on port ${this.grpcPort}`);
    } catch (error: any) {
      console.warn('Failed to start gRPC server:', error.message);
    }
  }

  private handleStateChange(event: StateChangeEvent): void {
    // 发布到事件总线，供其他组件监听
    this.eventBus.emit(event);
  }

  /**
   * 发布全局状态（同步到其他节点）
   */
  async publishState(key: string, value: any): Promise<boolean> {
    // 先更新本地
    this.stateStore.set(key, value, false); // 本地不广播，由我们统一控制
    
    // 广播到其他节点
    if (this.grpcClient) {
      try {
        return await this.grpcClient.publishState(key, value, this.nodeId);
      } catch (error: any) {
        console.warn('Failed to publish state to remote nodes:', error.message);
      }
    }
    
    return true;
  }

  /**
   * 获取全局状态快照
   */
  getStateSnapshot(filterPrefix?: string): Record<string, any> {
    return this.stateStore.snapshot(filterPrefix);
  }

  /**
   * 订阅全局状态变更
   */
  subscribeState(callback: (event: StateChangeEvent) => void): () => void {
    return this.stateStore.subscribe(callback);
  }

  private registerDefaultTools() {
    if (FileWriteTool.definition && FileWriteTool.execute) {
      this.toolRegistry.register(FileWriteTool.definition, FileWriteTool.execute);
    }
    if (FileReadTool.definition && FileReadTool.execute) {
      this.toolRegistry.register(FileReadTool.definition, FileReadTool.execute);
    }
  }

  async createAgent(config: AgentConfig): Promise<Agent> {
    let agent: BaseAgent;
    if (config.capabilities?.includes('openai') || !config.capabilities) {
      agent = new OpenAIAgent(config, this.toolRegistry, this.eventBus, this.context);
    } else {
      throw new Error('Unknown agent type');
    }

    this.agents.set(agent.id, agent);
    
    // 发布 agent 状态
    await this.publishState(`agent:${agent.id}:status`, {
      id: agent.id,
      name: agent.name,
      state: 'idle',
      capabilities: config.capabilities || [],
      timestamp: Date.now()
    });
    
    this.emitEvent('agent.created', { agentId: agent.id, name: agent.name });
    return agent.getDefinition();
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id)?.getDefinition();
  }

  listAgents(): Agent[] {
    return Array.from(this.agents.values()).map(a => a.getDefinition());
  }

  async processMessage(agentId: string, message: string, sessionId?: string): Promise<any> {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);
    
    // 更新 agent 状态为运行中
    await this.publishState(`agent:${agentId}:status`, {
      state: 'running',
      lastMessage: message,
      timestamp: Date.now()
    });
    
    const sid = sessionId || `session-${agentId}-${Date.now()}`;
    const result = await agent.processMessage(message, sid);
    
    // 恢复 idle 状态
    await this.publishState(`agent:${agentId}:status`, {
      state: 'idle',
      lastResult: typeof result === 'object' ? result : { output: result },
      timestamp: Date.now()
    });
    
    return { message: result, sessionId: sid };
  }

  // Global tool execution (not tied to a specific agent)
  async executeTool(toolName: string, input: any): Promise<any> {
    return this.toolRegistry.execute(toolName, input);
  }

  async executeAgentTool(agentId: string, toolName: string, input: any): Promise<any> {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);
    return agent.executeTool(toolName, input);
  }

  async chat(agentId: string, message: string, sessionId?: string): Promise<{ message: any; sessionId: string }> {
    return this.processMessage(agentId, message, sessionId);
  }

  getEventBus(): EventBus {
    return this.eventBus;
  }

  getContextManager(): ContextManager {
    return this.context;
  }

  getStateStore(): DistributedStateStore {
    return this.stateStore;
  }

  private emitEvent(type: string, payload: any) {
    const event: Event = {
      type,
      timestamp: Date.now(),
      payload
    };
    this.eventBus.emit(event);
  }
}
