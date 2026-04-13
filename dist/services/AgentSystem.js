"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSystem = void 0;
const GrpcProtocol_1 = require("../protocols/grpc/GrpcProtocol");
const WebSocketBus_1 = require("../protocols/websocket/WebSocketBus");
class AgentSystem {
    constructor() {
        this.grpcProtocol = new GrpcProtocol_1.GrpcProtocol();
        this.websocketBus = new WebSocketBus_1.WebSocketBus();
    }
    async start() {
        console.log('🚀 启动Agent系统...');
        // 启动gRPC协议
        await this.grpcProtocol.start();
        // 启动WebSocket消息总线
        await this.websocketBus.start();
        console.log('✅ Agent系统启动完成');
    }
    async stop() {
        console.log('🛑 停止Agent系统...');
        await this.grpcProtocol.stop();
        await this.websocketBus.stop();
        console.log('✅ Agent系统已停止');
    }
    async sendMessage(message) {
        console.log('📨 发送消息:', message);
        // 通过WebSocket总线发送消息
        await this.websocketBus.send(message);
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
            grpcRunning: this.grpcProtocol.isRunning,
            websocketRunning: this.websocketBus.isRunning
        };
    }
}
exports.AgentSystem = AgentSystem;
//# sourceMappingURL=AgentSystem.js.map