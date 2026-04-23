"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSystem = void 0;
const ToolRegistry_1 = require("./ToolRegistry");
const EventBus_1 = require("../core/EventBus");
const ContextManager_1 = require("./ContextManager");
const OpenAIAgent_1 = require("./OpenAIAgent");
const FileTools_1 = require("../tools/FileTools");
const DistributedStateStore_1 = require("../state/DistributedStateStore");
const GrpcClient_1 = require("../protocols/grpc/GrpcClient");
class AgentSystem {
    constructor() {
        this.agents = new Map();
        this.eventBus = new EventBus_1.EventBus();
        this.context = new ContextManager_1.ContextManager();
        this.toolRegistry = new ToolRegistry_1.ToolRegistry();
        this.nodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // 初始化分布式状态存储
        this.stateStore = new DistributedStateStore_1.DistributedStateStore({
            nodeId: this.nodeId,
            eventBus: this.eventBus
        });
        this.registerDefaultTools();
        // 初始化 gRPC 客户端（连接其他节点）
        this.initGrpcClient();
        // 监听状态变更，同步到全局
        this.stateStore.subscribe((event) => {
            this.handleStateChange(event);
        });
    }
    async initGrpcClient() {
        try {
            this.grpcClient = new GrpcClient_1.GrpcClient({
                host: 'localhost',
                port: 50051
            });
            // 订阅远程状态更新
            this.grpcClient.streamStateUpdates(this.nodeId, '', (update) => {
                const value = update.value ? JSON.parse(update.value.toString()) : null;
                const event = {
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
                const localStore = this.stateStore;
                if (localStore['handleRemoteUpdate']) {
                    localStore['handleRemoteUpdate'](event);
                }
            });
            console.log('gRPC state sync client initialized');
        }
        catch (error) {
            console.warn('Failed to initialize gRPC client, state sync disabled:', error);
        }
    }
    handleStateChange(event) {
        // 发布到事件总线，供其他组件监听
        this.eventBus.emit(event);
    }
    /**
     * 发布全局状态（同步到其他节点）
     */
    async publishState(key, value) {
        // 先更新本地
        this.stateStore.set(key, value, false); // 本地不广播，由我们统一控制
        // 广播到其他节点
        if (this.grpcClient) {
            return await this.grpcClient.publishState(key, value, this.nodeId);
        }
        return true;
    }
    /**
     * 获取全局状态快照
     */
    getStateSnapshot(filterPrefix) {
        return this.stateStore.snapshot(filterPrefix);
    }
    /**
     * 订阅全局状态变更
     */
    subscribeState(callback) {
        return this.stateStore.subscribe(callback);
    }
    // 其他方法保持不变...
    registerDefaultTools() {
        this.toolRegistry.register(FileTools_1.FileWriteTool.definition, FileTools_1.FileWriteTool.execute);
        this.toolRegistry.register(FileTools_1.FileReadTool.definition, FileTools_1.FileReadTool.execute);
    }
    async createAgent(config) {
        let agent;
        if (config.capabilities?.includes('openai') || !config.capabilities) {
            agent = new OpenAIAgent_1.OpenAIAgent(config, this.toolRegistry, this.eventBus, this.context);
        }
        else {
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
    getAgent(id) {
        return this.agents.get(id)?.getDefinition();
    }
    listAgents() {
        return Array.from(this.agents.values()).map(a => a.getDefinition());
    }
    async processMessage(agentId, message, sessionId) {
        const agent = this.agents.get(agentId);
        if (!agent)
            throw new Error(`Agent ${agentId} not found`);
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
    async executeTool(toolName, input) {
        return this.toolRegistry.execute(toolName, input);
    }
    async executeAgentTool(agentId, toolName, input) {
        const agent = this.agents.get(agentId);
        if (!agent)
            throw new Error(`Agent ${agentId} not found`);
        return agent.executeTool(toolName, input);
    }
    async chat(agentId, message, sessionId) {
        return this.processMessage(agentId, message, sessionId);
    }
    getEventBus() {
        return this.eventBus;
    }
    getContextManager() {
        return this.context;
    }
    getStateStore() {
        return this.stateStore;
    }
    emitEvent(type, payload) {
        const event = {
            type,
            timestamp: Date.now(),
            payload
        };
        this.eventBus.emit(event);
    }
}
exports.AgentSystem = AgentSystem;
//# sourceMappingURL=AgentSystem.js.map