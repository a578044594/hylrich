import { EnhancedMCPTool } from './EnhancedMCPTool';
import { promises as fs } from 'fs';

export class FileWriteTool extends EnhancedMCPTool {
  public readonly name = 'file_write';
  public readonly description = '写入文件内容';
  public readonly parameters: any = {
    type: 'object',
    properties: {
      path: { type: 'string', description: '文件路径' },
      content: { type: 'string', description: '文件内容' }
    },
    required: ['path', 'content'] // 现在是字符串数组
  } as const;

  protected async performExecution(input: { path: string; content: string }): Promise<void> {
    try {
      await fs.writeFile(input.path, input.content, 'utf-8');
    } catch (error) {
      throw new Error(`写入文件失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
