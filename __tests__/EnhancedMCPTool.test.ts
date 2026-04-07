import { EnhancedMCPTool } from '../src/tools/EnhancedMCPTool';

// 创建一个具体的实现用于测试
class TestTool extends EnhancedMCPTool {
  name = 'test_tool';
  description = '测试工具';
  parameters = {
    type: 'object',
    properties: { input: { type: 'string' } }
  };

  protected async executeInternal(input: any): Promise<any> {
    return { result: `processed: ${input.input}` };
  }
}

describe('EnhancedMCPTool', () => {
  let testTool: TestTool;

  beforeEach(() => {
    testTool = new TestTool();
  });

  test('should be created successfully', () => {
    expect(testTool).toBeInstanceOf(TestTool);
    expect(testTool.name).toBe('test_tool');
    expect(testTool.description).toBe('测试工具');
  });

  test('should execute successfully', async () => {
    const result = await testTool.execute({ input: 'test' });
    
    expect(result).toEqual({ result: 'processed: test' });
    
    const history = testTool.getExecutionHistory();
    expect(history).toHaveLength(1);
    expect(history[0].success).toBe(true);
  });

  test('should handle execution errors', async () => {
    // 创建一个会失败的测试工具
    class FailingTool extends EnhancedMCPTool {
      name = 'failing_tool';
      description = '失败工具';
      parameters = { type: 'object', properties: {} };

      protected async executeInternal(): Promise<any> {
        throw new Error('Execution failed');
      }
    }

    const failingTool = new FailingTool();
    
    await expect(failingTool.execute({})).rejects.toThrow('Execution failed');
    
    const history = failingTool.getExecutionHistory();
    expect(history).toHaveLength(1);
    expect(history[0].success).toBe(false);
    expect(history[0].error).toBeDefined();
  });

  test('should provide performance report', async () => {
    await testTool.execute({ input: 'test1' });
    await testTool.execute({ input: 'test2' });
    
    const report = testTool.getPerformanceReport();
    
    expect(report.totalExecutions).toBe(2);
    expect(report.successRate).toBe(100);
    expect(report.recentHistory).toHaveLength(2);
  });

  test('should limit execution history size', async () => {
    // 执行超过最大历史记录次数的操作
    for (let i = 0; i < 60; i++) {
      await testTool.execute({ input: `test${i}` });
    }
    
    const history = testTool.getExecutionHistory();
    expect(history).toHaveLength(50); // 默认最大50条记录
  });
});
