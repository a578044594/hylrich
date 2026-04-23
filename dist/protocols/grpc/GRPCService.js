"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GRPCService = void 0;
const grpc = __importStar(require("@grpc/grpc-js"));
const protoLoader = __importStar(require("@grpc/proto-loader"));
const path_1 = require("path");
class GRPCService {
    constructor(config) {
        this.config = config;
        this.stateStore = config.stateStore;
        this.server = new grpc.Server();
        this.setupServices();
    }
    setupServices() {
        // 加载proto文件
        const protoPath = this.config.protoPath || (0, path_1.join)(__dirname, '../protos/agent.proto');
        const packageDefinition = protoLoader.loadSync(protoPath, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        });
        const proto = grpc.loadPackageDefinition(packageDefinition);
        // 正确的proto结构访问
        const agentPackage = proto.openclaw?.agent;
        if (!agentPackage || !agentPackage.AgentService) {
            throw new Error('Failed to load AgentService from proto definition');
        }
        // 添加AgentService实现
        this.server.addService(agentPackage.AgentService.service, {
            ExecuteTool: this.executeTool.bind(this),
            GetSystemHealth: this.getSystemHealth.bind(this),
            StreamMetrics: this.streamMetrics.bind(this),
            // 状态同步
            StreamStateUpdates: this.streamStateUpdates.bind(this),
            PublishState: this.publishState.bind(this),
            GetCurrentState: this.getCurrentState.bind(this)
        });
        console.log('gRPC services with StateSync setup completed');
    }
    async executeTool(call, callback) {
        const { tool_name, input_data } = call.request;
        try {
            // 这里应该调用工具注册表执行
            const input = JSON.parse(input_data.toString());
            // 简化实现
            const result = {
                success: true,
                result: `Tool ${tool_name} executed (implementation pending)`,
                execution_time_ms: 0
            };
            callback(null, {
                success: true,
                result_data: Buffer.from(JSON.stringify(result)),
                execution_time_ms: 0
            });
        }
        catch (error) {
            callback(null, {
                success: false,
                result_data: Buffer.alloc(0),
                error_message: error.message,
                execution_time_ms: 0
            });
        }
    }
    getSystemHealth(call, callback) {
        const healthData = {
            timestamp: Date.now(),
            tool_count: 0,
            active_connections: this.server.getChannelzData ? 1 : 0,
            active_agents: this.stateStore ? 1 : 0,
            status: 'healthy'
        };
        callback(null, healthData);
    }
    streamMetrics(call) {
        const { interval_ms } = call.request;
        const interval = interval_ms || 1000;
        const timer = setInterval(() => {
            if (call.cancelled) {
                clearInterval(timer);
                return;
            }
            const metrics = {
                timestamp: Date.now(),
                cpu_usage: 0,
                memory_usage_mb: 0,
                message_throughput: 0
            };
            call.write(metrics);
        }, interval);
        call.on('cancelled', () => {
            clearInterval(timer);
        });
    }
    /**
     * 流式状态更新 - 客户端订阅状态变更
     */
    streamStateUpdates(call, callback) {
        const { client_id, filter_prefix } = call.request;
        console.log(`State stream started for client ${client_id}`);
        // 监听本地状态变更，转发给客户端
        const onStateChange = (event) => {
            if (call.cancelled) {
                return;
            }
            // 过滤前缀
            if (filter_prefix && !event.payload.key.startsWith(filter_prefix)) {
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
        };
        if (this.stateStore) {
            // 订阅状态变更
            this.stateStore.subscribe(onStateChange);
        }
        // 发送当前快照（可选）
        if (this.stateStore) {
            const snapshot = this.stateStore.snapshot(filter_prefix);
            for (const [key, value] of Object.entries(snapshot)) {
                if (call.cancelled)
                    break;
                call.write({
                    key,
                    value: Buffer.from(JSON.stringify(value)),
                    operation: 'set',
                    timestamp: Date.now(),
                    source: 'snapshot'
                });
            }
        }
        call.on('cancelled', () => {
            console.log(`State stream ended for client ${client_id}`);
            // 取消订阅会在客户端重连时重新建立，这里简化处理
        });
        // gRPC流式读取不需要显式回调，调用完成后保持连接
    }
    /**
     * 发布状态变更 - 客户端发送状态更新
     */
    publishState(call, callback) {
        const { key, value, source, timestamp } = call.request;
        try {
            const valueJson = value ? JSON.parse(value.toString()) : null;
            if (this.stateStore) {
                // 更新本地状态（不广播，避免循环）
                if (valueJson !== null) {
                    this.stateStore.get('_internal')?.set?.(key, valueJson, false);
                }
                else {
                    this.stateStore.get('_internal')?.delete?.(key, false);
                }
            }
            callback(null, { accepted: true });
        }
        catch (error) {
            callback(null, {
                accepted: false,
                error_message: `Invalid JSON value: ${error.message}`
            });
        }
    }
    /**
     * 获取当前状态快照
     */
    getCurrentState(call, callback) {
        const { filter_prefix } = call.request;
        if (this.stateStore) {
            const snapshot = this.stateStore.snapshot(filter_prefix || undefined);
            const stateMap = {};
            for (const [key, value] of Object.entries(snapshot)) {
                stateMap[key] = Buffer.from(JSON.stringify(value));
            }
            callback(null, {
                state: stateMap,
                timestamp: Date.now()
            });
        }
        else {
            callback(null, {
                state: {},
                timestamp: Date.now()
            });
        }
    }
    async start() {
        return new Promise((resolve, reject) => {
            this.server.bindAsync(`0.0.0.0:${this.config.port}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
                if (error) {
                    reject(error);
                }
                else {
                    console.log(`gRPC server with StateSync running on port ${port}`);
                    this.server.start();
                    resolve();
                }
            });
        });
    }
    async stop() {
        return new Promise((resolve) => {
            this.server.tryShutdown(() => {
                console.log('gRPC server stopped');
                resolve();
            });
        });
    }
    /**
     * 设置状态存储（用于依赖注入）
     */
    setStateStore(store) {
        this.stateStore = store;
    }
}
exports.GRPCService = GRPCService;
//# sourceMappingURL=GRPCService.js.map