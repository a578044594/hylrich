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
        let protoPath = this.config.protoPath || (0, path_1.join)(__dirname, '../protos/agent.proto');
        if (!require('fs').existsSync(protoPath)) {
            protoPath = (0, path_1.join)(__dirname, '../../protos/agent.proto');
        }
        const packageDefinition = protoLoader.loadSync(protoPath, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        });
        const proto = grpc.loadPackageDefinition(packageDefinition);
        const agentPackage = proto.openclaw?.agent;
        if (!agentPackage || !agentPackage.AgentService) {
            throw new Error('Failed to load AgentService from proto definition');
        }
        // Cast implementation to any to bypass strict overload checking
        const impl = {
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
    executeTool(call, callback) {
        const { tool_name, input_data } = call.request;
        try {
            const input = JSON.parse(input_data.toString('utf8'));
            const result = {
                success: true,
                result_data: Buffer.from(JSON.stringify({ output: `Mock result for ${tool_name}` })),
                execution_time_ms: 0
            };
            callback(null, {
                success: true,
                result_data: result.result_data,
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
            active_agents: this.stateStore ? 1 : 0,
            status: 'healthy'
        };
        callback(null, healthData);
    }
    streamMetrics(call, send) {
        const { interval_ms } = call.request;
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
            send.write(metrics);
        }, interval);
        call.on('cancelled', () => {
            clearInterval(timer);
        });
    }
    /**
     * 流式状态更新
     */
    streamStateUpdates(call, send) {
        const request = call.request;
        const { client_id, filter_prefix } = request;
        console.log(`[StateSync] Stream started for client ${client_id}`);
        // 发送当前快照
        if (this.stateStore) {
            const snapshot = this.stateStore.snapshot(filter_prefix || '');
            for (const [key, value] of Object.entries(snapshot)) {
                if (call.cancelled)
                    break;
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
        let unsubscribe;
        if (this.stateStore) {
            unsubscribe = this.stateStore.subscribe((event) => {
                if (call.cancelled) {
                    if (unsubscribe)
                        unsubscribe();
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
            if (unsubscribe)
                unsubscribe();
        });
    }
    /**
     * 发布状态变更
     */
    publishState(call, callback) {
        const { key, value, source, timestamp } = call.request;
        try {
            const valueJson = value ? JSON.parse(value.toString('utf8')) : null;
            if (this.stateStore) {
                const localStore = this.stateStore;
                // 使用内部方法直接更新状态，避免再次 gRPC 广播
                if (valueJson !== null) {
                    localStore._internal.set?.(key, valueJson, false);
                }
                else {
                    localStore._internal.delete?.(key, false);
                }
            }
            callback(null, { accepted: true });
        }
        catch (error) {
            console.error(`[StateSync] Publish error: ${error.message}`);
            callback(null, { accepted: false, error: error.message });
        }
    }
    /**
     * 获取当前状态快照
     */
    getCurrentState(call, callback) {
        const { filter_prefix } = call.request;
        try {
            const snapshot = this.stateStore ? this.stateStore.snapshot(filter_prefix) : {};
            // 将值序列化为 Buffer
            const serializedSnapshot = {};
            for (const [key, value] of Object.entries(snapshot)) {
                serializedSnapshot[key] = Buffer.from(JSON.stringify(value) || '');
            }
            callback(null, {
                state: serializedSnapshot,
                timestamp: Date.now()
            });
        }
        catch (error) {
            console.error(`[StateSync] GetCurrentState error: ${error.message}`);
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
                    console.log(`gRPC server started on port ${port}`);
                    this.server.start();
                    resolve();
                }
            });
        });
    }
    async stop() {
        return new Promise((resolve) => {
            this.server.tryShutdown(() => resolve());
        });
    }
}
exports.GRPCService = GRPCService;
//# sourceMappingURL=GRPCService.js.map