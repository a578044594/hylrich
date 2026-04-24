import { ToolDefinition, ToolResult, ToolExecutionContext } from '../types/tool';
import * as fs from 'fs';
import * as path from 'path';

function getToolRootDir(): string {
  return path.resolve(process.env.TOOL_ROOT_DIR || process.cwd());
}

function resolveSafePath(inputPath: string): string {
  const rootDir = getToolRootDir();
  const resolvedPath = path.resolve(inputPath);
  const relative = path.relative(rootDir, resolvedPath);

  // Ensure target path is within TOOL_ROOT_DIR boundary.
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`path is outside TOOL_ROOT_DIR: ${inputPath}`);
  }

  return resolvedPath;
}

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
      const safePath = resolveSafePath(p);
      const content = input.content ?? '';
      const dir = path.dirname(safePath);
      if (dir && !fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(safePath, content, 'utf8');
      return { status: 'success', data: { path: safePath, bytes: Buffer.byteLength(content) } };
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
      const safePath = resolveSafePath(p);
      if (!fs.existsSync(safePath)) throw new Error(`File not found: ${safePath}`);
      const content = fs.readFileSync(safePath, 'utf8');
      return { status: 'success', data: { path: safePath, content, size: content.length } };
    } catch (err: any) {
      return { status: 'error', error: err.message };
    }
  }
};
