import { EnhancedMCPTool } from './EnhancedMCPTool';

export class MockEnhancedMCPTool extends EnhancedMCPTool {
  public readonly name = 'mock_tool';
  public readonly description = '模拟工具';
  public readonly parameters: ToolInputJSONSchema = {
    type: 'object',
    properties: {
      message: { type: 'string', description: '输入消息' }
    },
    required: ['message']
  } as const;

  protected async performExecution(input: { message: string }): Promise<string> {
    return `模拟执行结果: ${input.message}`;
  }
}
