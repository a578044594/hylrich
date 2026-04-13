"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrpcProtocol = void 0;
const GrpcClient_1 = require("./GrpcClient");
class GrpcProtocol {
    constructor(target) {
        this.client = new GrpcClient_1.GrpcClient(target);
        this._isRunning = false;
    }
    get isRunning() {
        return this._isRunning;
    }
    async start() {
        if (this._isRunning) {
            console.log('⚠️ gRPC协议已在运行');
            return;
        }
        try {
            await this.client.connect();
            this._isRunning = true;
            console.log('🚀 gRPC协议已启动');
        }
        catch (error) {
            console.error('❌ gRPC协议启动失败:', error);
            throw error;
        }
    }
    async stop() {
        if (!this._isRunning) {
            console.log('⚠️ gRPC协议未运行');
            return;
        }
        try {
            await this.client.disconnect();
            this._isRunning = false;
            console.log('🛑 gRPC协议已停止');
        }
        catch (error) {
            console.error('❌ gRPC协议停止失败:', error);
            throw error;
        }
    }
    async executeTool(toolName, input) {
        if (!this._isRunning) {
            throw new Error('gRPC协议未运行');
        }
        return await this.client.executeTool(toolName, input);
    }
    async healthCheck() {
        if (!this._isRunning) {
            throw new Error('gRPC协议未运行');
        }
        return await this.client.healthCheck();
    }
    async getMetrics() {
        if (!this._isRunning) {
            throw new Error('gRPC协议未运行');
        }
        return await this.client.getMetrics();
    }
    async getSystemStats() {
        if (!this._isRunning) {
            throw new Error('gRPC协议未运行');
        }
        return await this.client.getSystemStats();
    }
}
exports.GrpcProtocol = GrpcProtocol;
//# sourceMappingURL=GrpcProtocol.js.map