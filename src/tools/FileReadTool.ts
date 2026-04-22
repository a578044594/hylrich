import { Tool } from '../core/Tool';
import { promises as fs } from 'fs';

export class FileReadTool extends Tool {
  public readonly name = 'file_read';
  public readonly description = '读取文件内容';
  public readonly parameters: any = {
    type: 'object',
    properties: {
      path: { type: 'string', description: '文件路径' }
    },
    required: ['path']
  };

  protected async performExecution(input: { path: string }): Promise<string> {
    try {
      const content = await fs.readFile(input.path, 'utf-8');
      return content;
    } catch (error) {
      throw new Error(`读取文件失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
