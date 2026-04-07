import { EnhancedMCPTool } from '../tools/EnhancedMCPTool';
import { ToolError } from '../core/ToolError';

export class FileReadTool extends EnhancedMCPTool {
  async executeInternal(params: any): Promise<any> {
    // 验证文件路径
    if (!params.path || typeof params.path !== "string") {
      throw new ToolError("文件路径必须是非空字符串");
    }

    // 安全检查：防止路径遍历攻击
    const normalizedPath = params.path.replace(/\\/g, '/');
    if (normalizedPath.includes('..') || normalizedPath.startsWith('.')) {
      throw new ToolError("无效的文件路径");
    }

    // 读取文件
    try {
      const fs = require('fs').promises;
      const content = await fs.readFile(params.path, 'utf8');
      return {
        success: true,
        content: content
      };
    } catch (error) {
      throw new ToolError(`文件读取失败: ${error.message}`);
    }
  }
}
