"use strict";
// Hylrich项目主入口
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSystem = exports.EnhancedMCPTool = exports.GrpcClient = exports.GrpcProtocol = exports.WebSocketBus = void 0;
exports.start = start;
const WebSocketBus_1 = require("./protocols/WebSocketBus");
Object.defineProperty(exports, "WebSocketBus", { enumerable: true, get: function () { return WebSocketBus_1.WebSocketBus; } });
const GrpcProtocol_1 = require("./protocols/grpc/GrpcProtocol");
Object.defineProperty(exports, "GrpcProtocol", { enumerable: true, get: function () { return GrpcProtocol_1.GrpcProtocol; } });
const GrpcClient_1 = require("./protocols/grpc/GrpcClient");
Object.defineProperty(exports, "GrpcClient", { enumerable: true, get: function () { return GrpcClient_1.GrpcClient; } });
const EnhancedMCPTool_1 = require("./protocols/EnhancedMCPTool");
Object.defineProperty(exports, "EnhancedMCPTool", { enumerable: true, get: function () { return EnhancedMCPTool_1.EnhancedMCPTool; } });
const AgentSystem_1 = require("./services/AgentSystem");
Object.defineProperty(exports, "AgentSystem", { enumerable: true, get: function () { return AgentSystem_1.AgentSystem; } });
// 启动系统
function start() {
    console.log('Hylrich系统启动中...');
    const agentSystem = new AgentSystem_1.AgentSystem();
    agentSystem.start();
    console.log('Hylrich系统启动完成');
}
//# sourceMappingURL=index.js.map