"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketBus = void 0;
const ws_1 = require("ws");
class WebSocketBus {
    constructor(port = 8080) {
        this.port = port;
        this.server = null;
        this.clients = new Map();
        this._isRunning = false;
    }
    get isRunning() {
        return this._isRunning;
    }
    async start() {
        if (this._isRunning) {
            console.log('⚠️ WebSocket总线已在运行');
            return;
        }
        this.server = new ws_1.WebSocketServer({ port: this.port });
        this.server.on('connection', (ws) => {
            console.log('🔌 新客户端连接');
            const clientId = Date.now().toString() + Math.random().toString(36).substr(2, 9); // 生成唯一ID
            this.clients.set(clientId, ws);
            ws.on('message', (message) => {
                console.log('📥 接收消息:', message);
                // 可以在这里实现消息处理逻辑
            });
            ws.on('close', () => {
                console.log('🔌 客户端断开连接');
                this.clients.delete(clientId);
            });
        });
        this._isRunning = true;
        console.log(`🚀 WebSocket总线启动在端口 ${this.port}`);
    }
    async stop() {
        if (!this._isRunning) {
            console.log('⚠️ WebSocket总线未运行');
            return;
        }
        if (this.server) {
            this.server.close();
        }
        this.clients.clear();
        this._isRunning = false;
        console.log('🛑 WebSocket总线已停止');
    }
    async send(message) {
        if (!this._isRunning) {
            throw new Error('WebSocket总线未运行');
        }
        const data = JSON.stringify(message);
        for (const [clientId, client] of this.clients.entries()) {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(data);
            }
        }
    }
    async broadcast(message) {
        if (!this._isRunning) {
            throw new Error('WebSocket总线未运行');
        }
        const data = JSON.stringify(message);
        this.server?.clients.forEach((client) => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(data);
            }
        });
    }
}
exports.WebSocketBus = WebSocketBus;
//# sourceMappingURL=WebSocketBus.js.map