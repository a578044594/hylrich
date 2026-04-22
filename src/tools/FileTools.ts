import { ToolDefinition, ToolResult, ToolExecutionContext } from '../types/tool';
import * as fs from 'fs';
import * as path from 'path';

export const FileWriteTool = {
  definition: {
    name: 'file_write',
    description: 'Write string content to a file',
    version: '1.0.0',
    parameters: [
      { name: 'path', type: 'string', description: 'File path', required: true },
      { name: 'content', type: 'string', description: 'Content to write', required: true }
    ]
  } as ToolDefinition,

  async execute(input: any, context?: ToolExecutionContext): Promise<ToolResult> {
    try {
      const p = input.path;
      if (!p) throw new Error('path is required');
      const content = input.content ?? '';
      const dir = path.dirname(p);
      if (dir && !fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(p, content, 'utf8');
      return { status: 'success', data: { path: p, bytes: Buffer.byteLength(content) } };
    } catch (err: any) {
      return { status: 'error', error: err.message };
    }
  }
};

export const FileReadTool = {
  definition: {
    name: 'file_read',
    description: 'Read file content',
    version: '1.0.0',
    parameters: [
      { name: 'path', type: 'string', description: 'File path', required: true }
    ]
  } as ToolDefinition,

  async execute(input: any, context?: ToolExecutionContext): Promise<ToolResult> {
    try {
      const p = input.path;
      if (!p) throw new Error('path is required');
      if (!fs.existsSync(p)) throw new Error(`File not found: ${p}`);
      const content = fs.readFileSync(p, 'utf8');
      return { status: 'success', data: { path: p, content, size: content.length } };
    } catch (err: any) {
      return { status: 'error', error: err.message };
    }
  }
};
