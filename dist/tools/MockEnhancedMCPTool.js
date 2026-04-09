"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedMCPTool = void 0;
const Tool_1 = require("../core/Tool");
class EnhancedMCPTool extends Tool_1.Tool {
    constructor() {
        super(...arguments);
        this.executionHistory = [];
        this.maxHistorySize = 50;
    }
    async execute(input) {
        const metrics = {
            startTime: Date.now(),
            memoryUsage: process.memoryUsage().heapUsed
        };
        try {
            const result = await this.executeInternal(input);
            metrics.endTime = Date.now();
            metrics.success = true;
            this.recordExecution(metrics.startTime, metrics.endTime);
            this.addToHistory(metrics);
            return result;
        }
        catch (error) {
            metrics.endTime = Date.now();
            metrics.success = false;
            metrics.error = error;
            this.addToHistory(metrics);
            throw error;
        }
    }
    addToHistory(metrics) {
        this.executionHistory.unshift(metrics);
        if (this.executionHistory.length > this.maxHistorySize) {
            this.executionHistory.pop();
        }
    }
    getExecutionHistory() {
        return [...this.executionHistory];
    }
    getPerformanceReport() {
        const stats = this.getPerformanceStats();
        const successful = this.executionHistory.filter(m => m.success).length;
        const failed = this.executionHistory.filter(m => !m.success).length;
        return {
            totalExecutions: stats.executionCount,
            successRate: stats.executionCount > 0
                ? (successful / stats.executionCount) * 100
                : 0,
            averageExecutionTime: stats.averageExecutionTime,
            recentHistory: this.executionHistory.slice(0, 10)
        };
    }
}
exports.EnhancedMCPTool = EnhancedMCPTool;
// Mock implementation for testing
class MockEnhancedMCPTool extends EnhancedMCPTool {
    constructor() {
        super(...arguments);
        this.name = 'mock-enhanced-mcp-tool';
        this.description = 'A mock tool for testing EnhancedMCPTool';
        this.parameters = {
            model: 'test-model',
            maxTokens: 100,
            temperature: 0.7,
            topP: 0.9,
            stopSequences: ['end'],
            other: { test: 'value' }
        };
    }
    async executeInternal(input) {
        return input; // Simply return the input for testing
    }
}
//# sourceMappingURL=MockEnhancedMCPTool.js.map