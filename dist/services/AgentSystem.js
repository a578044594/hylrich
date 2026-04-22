"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSystem = void 0;
const GrpcProtocol_1 = require("../protocols/grpc/GrpcProtocol");
class AgentSystem {
    constructor() {
        this.grpcProtocol = new GrpcProtocol_1.GrpcProtocol();
    }
    async start() {
        console.log('🚀 启动Agent系统...');
        try {
            await this.grpcProtocol.start();
        }
        catch (err) {
            console.warn('⚠️ gRPC启动失败，将以有限功能运行');
        }
        console.log('✅ Agent系统启动完成');
    }
    async stop() {
        console.log('🛑 停止Agent系统...');
        await this.grpcProtocol.stop();
        console.log('✅ Agent系统已停止');
    }
    async sendMessage(message) {
        console.log('📨 发送消息:', message);
        // 不依赖WebSocket总线，直接处理
    }
    async executeTool(toolName, input) {
        console.log(`🛠️ 执行工具: ${toolName}`);
        return await this.grpcProtocol.executeTool(toolName, input);
    }
    async healthCheck() {
        return await this.grpcProtocol.healthCheck();
    }
    getStatus() {
        return {
            grpcRunning: this.grpcProtocol.isRunning
        };
    }
}
exports.AgentSystem = AgentSystem;
//# sourceMappingURL=AgentSystem.js.map