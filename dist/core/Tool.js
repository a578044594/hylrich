"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tool = void 0;
class Tool {
    constructor() {
        // 性能监控
        this.executionCount = 0;
        this.totalExecutionTime = 0;
    }
    recordExecution(startTime, endTime) {
        this.executionCount++;
        this.totalExecutionTime += (endTime - startTime);
    }
    getPerformanceStats() {
        return {
            executionCount: this.executionCount,
            averageExecutionTime: this.executionCount > 0
                ? this.totalExecutionTime / this.executionCount
                : 0
        };
    }
}
exports.Tool = Tool;
//# sourceMappingURL=Tool.js.map