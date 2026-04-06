import { Tool } from '../src/core/Tool';

// 创建一个测试工具类
class TestTool extends Tool {
    name = 'test_tool';
    description = 'A test tool for unit testing';
    
    parameters = {
        type: 'object',
        properties: {
            input: {
                type: 'string',
                description: 'Test input'
            }
        },
        required: ['input']
    };

    async execute(input: any): Promise<any> {
        if (!input.input) {
            throw new Error('Input is required');
        }
        return { 
            result: `Processed: ${input.input}`,
            timestamp: Date.now()
        };
    }
}

describe('Tool Base Class', () => {
    let testTool: TestTool;

    beforeEach(() => {
        testTool = new TestTool();
    });

    test('should have correct name and description', () => {
        expect(testTool.name).toBe('test_tool');
        expect(testTool.description).toBe('A test tool for unit testing');
    });

    test('should have defined parameters schema', () => {
        expect(testTool.parameters).toBeDefined();
        expect(testTool.parameters.type).toBe('object');
        expect(testTool.parameters.properties).toBeDefined();
    });

    test('should execute successfully with valid input', async () => {
        const result = await testTool.execute({ input: 'test data' });
        
        expect(result).toBeDefined();
        expect(result.result).toBe('Processed: test data');
        expect(result.timestamp).toBeDefined();
    });

    test('should handle execution errors', async () => {
        // 测试错误处理
        await expect(testTool.execute({})).rejects.toThrow('Input is required');
    });
});
