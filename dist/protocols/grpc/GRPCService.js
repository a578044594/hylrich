"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GRPCService = void 0;
const grpc_js_1 = require("@grpc/grpc-js");
class GRPCService {
    constructor(port = 50051) {
        this.isRunning = false;
        this.port = port;
        this.server = new grpc_js_1.Server();
    }
    setupServices() {
        // 简化的服务实现
        const agentServiceImpl = {
            ExecuteTool: async (call, callback) => {
                try {
                    const { tool_name, input } = call.request;
                    console.log(`📡 gRPC调用工具: ${tool_name}`);
                    callback(null, { result: `执行成功: ${tool_name}`, error: '' });
                }
                catch (error) {
                    callback(null, { result: '', error: error.message });
                }
            },
            HealthCheck: async (call, callback) => {
                callback(null, { healthy: this.isRunning, status: this.isRunning ? '服务运行正常' : '服务未就绪' });
            },
            GetMetrics: async (call, callback) => {
                callback(null, { metrics: { connections: 0, requests: 0, errors: 0 } });
            },
            GetSystemStats: async (call, callback) => {
                callback(null, { cpu_usage: 0.1, memory_usage: 0.2, active_connections: 0 });
            }
        };
        // 使用类型断言添加服务
        this.server.addService(agent_1.agent.AgentService, agentServiceImpl);
    }
    async start() {
        try {
            this.setupServices();
            await new Promise((resolve, reject) => {
                this.server.bindAsync(`0.0.0.0:${this.port}`, grpc_js_1.ServerCredentials.createInsecure(), (error) => {
                    if (error)
                        reject(error);
                    else {
                        this.server.start();
                        this.isRunning = true;
                        console.log(`🚀 gRPC服务启动在端口 ${this.port}`);
                        resolve();
                    }
                });
            });
        }
        catch (error) {
            console.warn('⚠️ gRPC启动失败，将跳过:', error);
            throw error;
        }
    }
    async stop() {
        return new Promise((resolve) => {
            if (this.isRunning) {
                this.server.tryShutdown(() => {
                    this.isRunning = false;
                    console.log('🛑 gRPC服务已停止');
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    }
    isServiceRunning() {
        return this.isRunning;
    }
}
exports.GRPCService = GRPCService;
//# sourceMappingURL=GRPCService.js.map