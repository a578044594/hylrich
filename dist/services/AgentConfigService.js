"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAgentSystem = createAgentSystem;
const AgentSystem_1 = require("./AgentSystem");
/**
 * 加载并配置 AgentSystem
 * 此处集中所有系统组件的初始化
 */
async function createAgentSystem() {
    const system = new AgentSystem_1.AgentSystem();
    // 可以根据环境变量使能/禁用 gRPC 等特性
    const enableGrpc = process.env.ENABLE_GRPC !== 'false';
    const grpcPort = parseInt(process.env.GRPC_PORT || '50051', 10);
    if (enableGrpc) {
        // AgentSystem 构造函数已自动启动 gRPC 服务器
        console.log(`AgentSystem will start gRPC server on port ${grpcPort} (ENABLE_GRPC=${enableGrpc})`);
    }
    return system;
}
//# sourceMappingURL=AgentConfigService.js.map