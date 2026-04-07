"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GRPCService = void 0;
const grpc_js_1 = require("@grpc/grpc-js");
const util_1 = require("util");
const EnhancedMCPTool_1 = require("../../tools/EnhancedMCPTool");
const BasicMetricsCollector_1 = require("../../monitoring/BasicMetricsCollector");
const agent_1 = require("../../generated/agent"); // 修正导入
class GRPCService {
    constructor(config) {
        this.config = config;
        this.executionMetrics = new Map();
        this.server = new grpc_js_1.Server();
        this.enhancedTool = new EnhancedMCPTool_1.EnhancedMCPTool();
        this.metricsCollector = new BasicMetricsCollector_1.BasicMetricsCollector();
        this.setupService();
    }
    setupService() {
        // 注册gRPC服务方法
        this.server.addService(agent_1.AgentService, {
            executeTool: this.executeTool.bind(this),
            checkHealth: this.checkHealth.bind(this),
            getMetrics: this.getMetrics.bind(this),
            getSystemStats: this.getSystemStats.bind(this),
            streamTools: this.streamTools.bind(this),
            streamMetrics: this.streamMetrics.bind(this),
            streamHealth: this.streamHealth.bind(this)
        });
    }
    async executeTool(call, callback) {
        const request = call.request;
        const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // 记录执行开始
        this.executionMetrics.set(executionId, {
            startTime: Date.now()
        });
        try {
            console.log(`Executing tool: ${request.toolName}`);
            const result = await this.enhancedTool.execute({
                tool_name: request.tool_name,
                parameters: request.parameters || {}
            });
            // 记录执行成功
            this.executionMetrics.get(executionId).endTime = Date.now();
            this.executionMetrics.get(executionId).success = true;
            const executionTime = Date.now() - this.executionMetrics.get(executionId).startTime;
            const response = {
                success: true,
                result: JSON.stringify(result),
                executionTime,
                executionId
            };
            callback(null, response);
        }
        catch (error) {
            // 记录执行失败
            this.executionMetrics.get(executionId).endTime = Date.now();
            this.executionMetrics.get(executionId).success = false;
            this.executionMetrics.get(executionId).error = error.message;
            const executionTime = Date.now() - this.executionMetrics.get(executionId).startTime;
            const response = {
                success: false,
                error: error.message,
                executionTime,
                executionId
            };
            callback(null, response);
        }
    }
    async checkHealth(call, callback) {
        const request = call.request;
        const response = {
            status: 'SERVING',
            services: ['agent'],
            timestamp: Date.now(),
            version: '1.0.0'
        };
        callback(null, response);
    }
    async getMetrics(call, callback) {
        const request = call.request;
        const metrics = [
            {
                name: 'tool_execution_count',
                value: this.executionMetrics.size,
                timestamp: Date.now(),
                tags: { service: 'agent' }
            },
            {
                name: 'successful_executions',
                value: Array.from(this.executionMetrics.values()).filter(m => m.success).length,
                timestamp: Date.now(),
                tags: { service: 'agent' }
            },
            {
                name: 'failed_executions',
                value: Array.from(this.executionMetrics.values()).filter(m => !m.success).length,
                timestamp: Date.now(),
                tags: { service: 'agent' }
            }
        ];
        const response = {
            metrics: metrics.map(m => ({
                name: m.name,
                value: m.value,
                timestamp: m.timestamp,
                tags: m.tags || {}
            }))
        };
        callback(null, response);
    }
    async getSystemStats(call, callback) {
        const request = call.request;
        const response = {
            totalTools: 1, // 目前只有EnhancedMCPTool
            activeConnections: 0,
            memoryUsage: process.memoryUsage().heapUsed,
            uptime: process.uptime(),
            timestamp: Date.now()
        };
        callback(null, response);
    }
    streamTools(call) {
        // 流式工具执行（待实现）
        call.write({
            toolName: 'stream_tool',
            message: 'Streaming not yet implemented'
        });
        call.end();
    }
    streamMetrics(call) {
        // 流式指标监控（待实现）
        const interval = setInterval(() => {
            call.write({
                name: 'stream_metric',
                value: Math.random() * 100,
                timestamp: Date.now()
            });
        }, 1000);
        call.on('cancelled', () => {
            clearInterval(interval);
        });
    }
    streamHealth(call) {
        // 流式健康检查（待实现）
        const interval = setInterval(() => {
            call.write({
                status: 'SERVING',
                timestamp: Date.now()
            });
        }, 5000);
        call.on('cancelled', () => {
            clearInterval(interval);
        });
    }
    async start() {
        const startAsync = (0, util_1.promisify)(this.server.bindAsync).bind(this.server);
        await startAsync(`${this.config.host || '0.0.0.0'}:${this.config.port}`, grpc_js_1.ServerCredentials.createInsecure());
        console.log(`gRPC server started on port ${this.config.port}`);
    }
    async stop() {
        const shutdownAsync = (0, util_1.promisify)(this.server.tryShutdown).bind(this.server);
        await shutdownAsync();
        console.log('gRPC server stopped');
    }
}
exports.GRPCService = GRPCService;
//# sourceMappingURL=GRPCService.js.map