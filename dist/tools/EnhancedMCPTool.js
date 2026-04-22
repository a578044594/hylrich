"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedMCPTool = void 0;
const GrpcClient_1 = require("../protocols/grpc/GrpcClient");
class EnhancedMCPTool {
    constructor() {
        this.name = 'enhanced_mcp';
        this.description = '通过增强MCP协议执行远程工具调用';
        this.parameters = {
            type: 'object',
            properties: {
                serverUrl: { type: 'string', description: '目标服务器地址' },
                toolName: { type: 'string', description: '要调用的工具名' },
                input: { type: 'object', description: '工具输入参数' }
            },
            required: ['toolName']
        };
        this.executionCount = 0;
        this.errorCount = 0;
        this.executionHistory = [];
        this.client = new GrpcClient_1.GrpcClient('localhost:50051');
    }
    async performExecution(input) {
        const startTime = Date.now();
        this.executionCount++;
        try {
            const { toolName, input: toolInput, serverUrl } = input;
            if (serverUrl) {
                this.client = new GrpcClient_1.GrpcClient(serverUrl);
            }
            // 模拟gRPC调用
            console.log(`🔧 执行工具: ${toolName}`);
            const result = await this.client.executeTool(toolName, toolInput || {});
            const duration = Date.now() - startTime;
            this.executionHistory.push({
                toolName,
                success: true,
                duration,
                timestamp: new Date().toISOString()
            });
            return { result };
        }
        catch (error) {
            this.errorCount++;
            const duration = Date.now() - startTime;
            this.executionHistory.push({
                toolName: input.toolName,
                success: false,
                duration,
                timestamp: new Date().toISOString(),
                error: error.message
            });
            throw error;
        }
    }
    getPerformanceStats() {
        const successRate = this.executionCount > 0
            ? ((this.executionCount - this.errorCount) / this.executionCount) * 100
            : 0;
        const errorRate = this.executionCount > 0
            ? (this.errorCount / this.executionCount) * 100
            : 0;
        return {
            totalExecutions: this.executionCount,
            errorCount: this.errorCount,
            errorRate,
            successRate,
            executionHistory: this.executionHistory
        };
    }
}
exports.EnhancedMCPTool = EnhancedMCPTool;
//# sourceMappingURL=EnhancedMCPTool.js.map