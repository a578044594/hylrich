"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GRPCService = void 0;
const grpc_js_1 = require("@grpc/grpc-js");
const agent_1 = require("../../generated/agent");
class GRPCService {
    constructor(port = 50051) {
        this.port = port;
        this.server = new grpc_js_1.Server();
        this.setupServices();
    }
    setupServices() {
        // 实现AgentService接口
        const agentServiceImpl = {
            executeTool: this.executeTool.bind(this),
            healthCheck: this.healthCheck.bind(this),
            getMetrics: this.getMetrics.bind(this),
            getSystemStats: this.getSystemStats.bind(this)
        };
        // 注册服务
        this.server.addService(agent_1.AgentService, agentServiceImpl);
    }
    async executeTool(call, callback) {
        try {
            const { tool_name, input } = call.request;
            console.log(`📡 gRPC调用工具: ${tool_name}`);
            // 这里需要实现工具执行逻辑
            const result = `工具 ${tool_name} 执行结果`;
            callback(null, { result });
        }
        catch (error) {
            callback(null, { error: error.message });
        }
    }
    async healthCheck(call, callback) {
        callback(null, {
            healthy: true,
            status: '服务运行正常'
        });
    }
    async getMetrics(call, callback) {
        callback(null, {
            metrics: {
                'active_connections': 0,
                'request_count': 0,
                'error_rate': 0
            }
        });
    }
    async getSystemStats(call, callback) {
        callback(null, {
            cpu_usage: 0.1,
            memory_usage: 0.2,
            active_connections: 0
        });
    }
    async start() {
        return new Promise((resolve, reject) => {
            this.server.bindAsync(`0.0.0.0:${this.port}`, grpc_js_1.ServerCredentials.createInsecure(), (error, port) => {
                if (error) {
                    reject(error);
                }
                else {
                    console.log(`🚀 gRPC服务启动在端口 ${port}`);
                    resolve();
                }
            });
        });
    }
    async stop() {
        return new Promise((resolve) => {
            this.server.tryShutdown(() => {
                console.log('🛑 gRPC服务已停止');
                resolve();
            });
        });
    }
}
exports.GRPCService = GRPCService;
//# sourceMappingURL=GRPCService.js.map