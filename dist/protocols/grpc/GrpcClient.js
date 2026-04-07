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
        try {
            const packageDefinition = protoLoader.loadSync((0, path_1.join)(__dirname, '../../../protos/agent.proto'), {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            });
            const agentPackage = grpc.loadPackageDefinition(packageDefinition);
            // 创建客户端
            this.client = new agentPackage.agent.AgentService(`${this.config.host}:${this.config.port}`, this.config.credentials || grpc.credentials.createInsecure());
        }
        catch (error) {
            console.error('Failed to setup gRPC client:', error);
            throw error;
        }
    }
    async executeTool(request) {
        return new Promise((resolve, reject) => {
            this.client.executeTool(request, (error, response) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(response);
            });
        });
    }
    async getMetrics(request) {
        return new Promise((resolve, reject) => {
            this.client.getMetrics(request, (error, response) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(response);
            });
        });
    }
    async healthCheck(request) {
        return new Promise((resolve, reject) => {
            this.client.healthCheck(request, (error, response) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(response);
            });
        });
    }
    // 新增流式方法
    streamTools(requests) {
        const call = this.client.streamTools();
        return {
            [Symbol.asyncIterator]() {
                return {
                    next: async () => {
                        return new Promise((resolve, reject) => {
                            call.on('data', (response) => {
                                resolve({ value: response, done: false });
                            });
                            call.on('end', () => {
                                resolve({ value: undefined, done: true });
                            });
                            call.on('error', (error) => {
                                reject(error);
                            });
                            // 发送请求
                            (async () => {
                                for await (const request of requests) {
                                    call.write(request);
                                }
                                call.end();
                            })();
                        });
                    },
                    return: async () => {
                        call.cancel();
                        return { value: undefined, done: true };
                    }
                };
            }
        };
    }
    streamMetrics(request) {
        const call = this.client.streamMetrics(request);
        return {
            [Symbol.asyncIterator]() {
                return {
                    next: async () => {
                        return new Promise((resolve, reject) => {
                            call.on('data', (update) => {
                                resolve({ value: update, done: false });
                            });
                            call.on('end', () => {
                                resolve({ value: undefined, done: true });
                            });
                            call.on('error', (error) => {
                                reject(error);
                            });
                        });
                    },
                    return: async () => {
                        call.cancel();
                        return { value: undefined, done: true };
                    }
                };
            }
        };
    }
    streamHealth(request) {
        const call = this.client.streamHealth(request);
        return {
            [Symbol.asyncIterator]() {
                return {
                    next: async () => {
                        return new Promise((resolve, reject) => {
                            call.on('data', (update) => {
                                resolve({ value: update, done: false });
                            });
                            call.on('end', () => {
                                resolve({ value: undefined, done: true });
                            });
                            call.on('error', (error) => {
                                reject(error);
                            });
                        });
                    },
                    return: async () => {
                        call.cancel();
                        return { value: undefined, done: true };
                    }
                };
            }
        };
    }
    close() {
        if (this.client) {
            this.client.close();
        }
    }
}
exports.GrpcClient = GrpcClient;
//# sourceMappingURL=GrpcClient.js.map