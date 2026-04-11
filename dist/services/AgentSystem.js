"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSystem = void 0;
const EventEmitter_1 = require("../core/EventEmitter");
const WebSocketBus_1 = require("../protocols/WebSocketBus");
const GrpcProtocol_1 = require("../protocols/grpc/GrpcProtocol");
const EnhancedMCPTool_1 = require("../protocols/EnhancedMCPTool");
class AgentSystem extends EventEmitter_1.EventEmitter {
    constructor(config = {}) {
        super();
        this.config = config;
        this.isRunning = false;
    }
    async start() {
        if (this.isRunning) {
            throw new Error('AgentSystem is already running');
        }
        this.isRunning = true;
        // 初始化WebSocket总线
        if (this.config.webSocketUrl) {
            this.webSocketBus = new WebSocketBus_1.WebSocketBus({
                url: this.config.webSocketUrl
            });
            await this.webSocketBus.connect();
            this.webSocketBus.on('message', (message) => {
                this.handleWebSocketMessage(message);
            });
        }
        // 初始化gRPC协议
        if (this.config.grpcPort) {
            this.grpcProtocol = new GrpcProtocol_1.GrpcProtocol({
                port: this.config.grpcPort
            });
            await this.grpcProtocol.start();
        }
        // 初始化MCP工具
        this.mcpTool = new EnhancedMCPTool_1.EnhancedMCPTool();
        this.emit('started');
        console.log('AgentSystem started successfully');
    }
    async stop() {
        if (!this.isRunning) {
            return;
        }
        this.isRunning = false;
        if (this.webSocketBus) {
            this.webSocketBus.disconnect();
        }
        if (this.grpcProtocol) {
            await this.grpcProtocol.stop();
        }
        this.emit('stopped');
        console.log('AgentSystem stopped');
    }
    handleWebSocketMessage(message) {
        // 处理WebSocket消息
        this.emit('websocket_message', message);
    }
    getStatus() {
        return {
            running: this.isRunning,
            webSocketConnected: this.webSocketBus?.getConnectionStatus().connected || false,
            grpcRunning: this.grpcProtocol?.isRunning() || false
        };
    }
    async executeTool(toolName, input) {
        if (!this.isRunning) {
            throw new Error('AgentSystem is not running');
        }
        // 这里可以实现工具执行逻辑
        // 暂时返回模拟结果
        return {
            success: true,
            result: `Tool ${toolName} executed successfully`,
            timestamp: Date.now()
        };
    }
}
exports.AgentSystem = AgentSystem;
//# sourceMappingURL=AgentSystem.js.map