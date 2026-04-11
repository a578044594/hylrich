"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tool = void 0;
const ToolError_1 = require("./ToolError");
class Tool {
    constructor() {
        this.executionCount = 0;
        this.errorCount = 0;
        this.executionHistory = [];
    }
    async execute(input) {
        const startTime = Date.now();
        const metrics = {
            startTime,
            success: false
        };
        try {
            this.executionCount++;
            // 验证输入
            this.validateInput(input);
            // 执行工具逻辑
            const result = await this.performExecution(input);
            metrics.endTime = Date.now();
            metrics.success = true;
            this.executionHistory.push(metrics);
            return result;
        }
        catch (error) {
            this.errorCount++;
            metrics.endTime = Date.now();
            metrics.error = error;
            this.executionHistory.push(metrics);
            throw error;
        }
    }
    validateInput(input) {
        const schema = this.parameters;
        // 检查必需字段
        if (schema.required) {
            for (const field of schema.required) {
                if (input[field] === undefined) {
                    throw new ToolError_1.ToolValidationError(`Missing required field: ${field}`, field);
                }
            }
        }
        // 检查字段类型（简化版本）
        for (const [field, propSchema] of Object.entries(schema.properties)) {
            if (input[field] !== undefined) {
                const value = input[field];
                const expectedType = propSchema.type;
                if (expectedType === 'string' && typeof value !== 'string') {
                    throw new ToolError_1.ToolValidationError(`Field ${field} must be a string`, field);
                }
                if (expectedType === 'number' && typeof value !== 'number') {
                    throw new ToolError_1.ToolValidationError(`Field ${field} must be a number`, field);
                }
                if (expectedType === 'boolean' && typeof value !== 'boolean') {
                    throw new ToolError_1.ToolValidationError(`Field ${field} must be a boolean`, field);
                }
            }
        }
    }
    getPerformanceStats() {
        const totalExecutions = this.executionCount;
        const errorRate = totalExecutions > 0 ? (this.errorCount / totalExecutions) * 100 : 0;
        const successRate = 100 - errorRate;
        return {
            totalExecutions,
            errorCount: this.errorCount,
            errorRate,
            successRate,
            executionHistory: this.executionHistory.slice(-10) // 最近10次执行
        };
    }
    resetStats() {
        this.executionCount = 0;
        this.errorCount = 0;
        this.executionHistory = [];
    }
}
exports.Tool = Tool;
//# sourceMappingURL=Tool.js.map