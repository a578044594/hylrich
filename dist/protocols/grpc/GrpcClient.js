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
exports.GrpcClient = void 0;
const grpc = __importStar(require("@grpc/grpc-js"));
const protoLoader = __importStar(require("@grpc/proto-loader"));
const path_1 = require("path");
class GrpcClient {
    constructor(config) {
        this.config = config;
        this.setupClient();
    }
    setupClient() {
        // 加载proto文件
        const packageDefinition = protoLoader.loadSync((0, path_1.join)(__dirname, '../../protos/agent.proto'), {
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
        // 创建客户端
        this.client = new agentPackage.AgentService(`${this.config.host}:${this.config.port}`, this.config.credentials || grpc.credentials.createInsecure());
    }
    async executeTool(toolName, input) {
        return new Promise((resolve, reject) => {
            this.client.ExecuteTool({
                tool_name: toolName,
                input_data: Buffer.from(JSON.stringify(input))
            }, (error, response) => {
                if (error) {
                    reject(error);
                }
                else {
                    if (response.success) {
                        resolve(JSON.parse(response.result_data.toString()));
                    }
                    else {
                        reject(new Error(response.error_message));
                    }
                }
            });
        });
    }
    async getSystemHealth() {
        return new Promise((resolve, reject) => {
            this.client.GetSystemHealth({}, (error, response) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(response);
                }
            });
        });
    }
    streamMetrics(intervalMs = 1000, callback) {
        const call = this.client.StreamMetrics({ interval_ms: intervalMs });
        call.on('data', (metrics) => {
            callback(metrics);
        });
        call.on('error', (error) => {
            console.error('gRPC stream error:', error);
        });
        call.on('end', () => {
            console.log('gRPC stream ended');
        });
        // 返回取消函数
        return () => {
            call.cancel();
        };
    }
    close() {
        grpc.closeClient(this.client);
    }
}
exports.GrpcClient = GrpcClient;
//# sourceMappingURL=GrpcClient.js.map