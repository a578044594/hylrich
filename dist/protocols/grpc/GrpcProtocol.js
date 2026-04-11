"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrpcProtocol = void 0;
const EventEmitter_1 = require("../../core/EventEmitter");
class GrpcProtocol extends EventEmitter_1.EventEmitter {
    constructor(config) {
        super();
        this.isRunning = false;
        this.config = config;
    }
    async start() {
        if (this.isRunning) {
            throw new Error('GrpcProtocol is already running');
        }
        this.isRunning = true;
        // 模拟gRPC服务器启动
        console.log(`gRPC server starting on port ${this.config.port}`);
        // 实际实现需要grpc库
        this.emit('started');
    }
    async stop() {
        if (!this.isRunning) {
            return;
        }
        this.isRunning = false;
        console.log('gRPC server stopped');
        this.emit('stopped');
    }
    isRunning() {
        return this.isRunning;
    }
}
exports.GrpcProtocol = GrpcProtocol;
//# sourceMappingURL=GrpcProtocol.js.map