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
const EnhancedMCPTool_1 = require("../../tools/EnhancedMCPTool");
class GRPCService {
    constructor(config) {
        this.config = config;
        this.server = new grpc.Server();
        this.enhancedTool = new EnhancedMCPTool_1.EnhancedMCPTool();
        this.metricsCollector = null;
        this.setupServices();
    }
    setupServices() {
        // 加载proto文件
        const packageDefinition = protoLoader.loadSync((0, path_1.join)(__dirname, '../protos/agent.proto'), {
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
            StreamMetrics: this.streamMetrics.bind(this)
        });
        console.log('gRPC services setup completed');
    }
    async executeTool(call, callback) {
        const startTime = Date.now();
        try {
            const { tool_name, input_data } = call.request;
            // 解析输入数据
            const input = JSON.parse(input_data.toString());
            // 执行工具
            const result = await this.enhancedTool.execute(input);
            const executionTime = Date.now() - startTime;
            // 记录指标
            this.metricsCollector.recordMetric('grpc_tool_execution_time', executionTime, {
                tool: tool_name,
                success: 'true'
            });
            callback(null, {
                success: true,
                result_data: Buffer.from(JSON.stringify(result)),
                execution_time_ms: executionTime
            });
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.metricsCollector.recordMetric('grpc_tool_execution_time', executionTime, {
                tool: call.request.tool_name,
                success: 'false',
                error: error instanceof Error ? error.message : 'unknown'
            });
            callback(null, {
                success: false,
                error_message: error instanceof Error ? error.message : 'Unknown error',
                execution_time_ms: executionTime
            });
        }
    }
    getSystemHealth(call, callback) {
        const healthData = {
            timestamp: Date.now(),
            tool_count: 1, // 目前只有一个工具
            active_connections: 0, // 需要实现连接计数
            active_agents: 1,
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
                cpu_usage: Math.random() * 100, // 模拟CPU使用率
                memory_usage_mb: process.memoryUsage().heapUsed / 1024 / 1024,
                message_throughput: Math.floor(Math.random() * 1000) // 模拟消息吞吐量
            };
            call.write(metrics);
        }, interval);
        call.on('cancelled', () => {
            clearInterval(timer);
        });
    }
    async start() {
        return new Promise((resolve, reject) => {
            this.server.bindAsync(`0.0.0.0:${this.config.port}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
                if (error) {
                    reject(error);
                }
                else {
                    console.log(`gRPC server running on port ${port}`);
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
}
exports.GRPCService = GRPCService;
//# sourceMappingURL=GRPCService.js.map