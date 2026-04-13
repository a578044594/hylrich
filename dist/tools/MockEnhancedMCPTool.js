"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockEnhancedMCPTool = void 0;
const EnhancedMCPTool_1 = require("./EnhancedMCPTool");
class MockEnhancedMCPTool extends EnhancedMCPTool_1.EnhancedMCPTool {
    constructor() {
        super(...arguments);
        this.name = 'mock_tool';
        this.description = '模拟工具';
        this.parameters = {
            type: 'object',
            properties: {
                message: { type: 'string', description: '输入消息' }
            },
            required: ['message']
        };
    }
    async performExecution(input) {
        return `模拟执行结果: ${input.message}`;
    }
}
exports.MockEnhancedMCPTool = MockEnhancedMCPTool;
//# sourceMappingURL=MockEnhancedMCPTool.js.map