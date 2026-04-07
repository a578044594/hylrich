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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HylrichCore = void 0;
const WebSocketBus_1 = require("./protocols/WebSocketBus");
__exportStar(require("./core/Tool"), exports);
__exportStar(require("./protocols/WebSocketBus"), exports);
__exportStar(require("./tools/EnhancedMCPTool"), exports);
class HylrichCore {
    constructor() {
        this.tools = new Map();
        this.wsBus = null;
        console.log("🚀 Hylrich AI Agent管理系统初始化");
    }
    registerTool(tool) {
        this.tools.set(tool.name, tool);
        console.log(`✅ 注册工具: ${tool.name}`);
    }
    async connectWebSocket(config) {
        this.wsBus = new WebSocketBus_1.WebSocketBus(config);
        await this.wsBus.connect();
        console.log("✅ WebSocket连接已建立");
    }
    async executeTool(toolName, input) {
        const tool = this.tools.get(toolName);
        if (!tool) {
            throw new Error(`工具未找到: ${toolName}`);
        }
        console.log(`🛠️ 执行工具: ${toolName}`);
        const result = await tool.execute(input);
        // 发送执行结果到WebSocket
        if (this.wsBus) {
            this.wsBus.send({
                type: "tool_execution_result",
                tool: toolName,
                result: result,
                timestamp: Date.now()
            });
        }
        return result;
    }
    getToolStats(toolName) {
        const tool = this.tools.get(toolName);
        return tool ? tool.getPerformanceReport() : null;
    }
    shutdown() {
        if (this.wsBus) {
            this.wsBus.disconnect();
        }
        console.log("🛑 Hylrich系统已关闭");
    }
}
exports.HylrichCore = HylrichCore;
return this.scheduler.scheduleTask(agentName, input, priority);
getAgentStats(agentName, string);
{
    return this.scheduler.getAgentStats(agentName);
}
getQueueStats();
{
    return this.scheduler.getQueueStats();
}
//# sourceMappingURL=index.js.map