"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockEnhancedMCPTool = void 0;
class MockEnhancedMCPTool extends EnhancedMCPTool {
    constructor() {
        super();
        this.name = 'MockEnhancedMCPTool';
        this.description = 'Mock MCP tool for testing';
        this.parameters = {
            type: 'object',
            properties: {
                input: {
                    type: 'string',
                    description: 'Input data for the tool'
                }
            },
            required: ['input']
        };
    }
    async execute(input) {
        console.log('Mock MCP tool executed with input:', input);
        return {
            result: input,
            success: true,
            metrics: {
                executionTime: 100,
                memoryUsage: 512,
                errorRate: 0
            }
        };
    }
}
exports.MockEnhancedMCPTool = MockEnhancedMCPTool;
//# sourceMappingURL=MockEnhancedMCPTool.js.map