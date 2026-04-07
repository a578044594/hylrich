"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileReadTool = void 0;
const EnhancedMCPTool_1 = require("../tools/EnhancedMCPTool");
const ToolError_1 = require("../core/ToolError");
class FileReadTool extends EnhancedMCPTool_1.EnhancedMCPTool {
    async executeInternal(params) {
        // 验证文件路径
        if (!params.path || typeof params.path !== "string") {
            throw new ToolError_1.ToolError("文件路径必须是非空字符串");
        }
        // 安全检查：防止路径遍历攻击
        const normalizedPath = params.path.replace(/\\/g, '/');
        if (normalizedPath.includes('..') || normalizedPath.startsWith('.')) {
            throw new ToolError_1.ToolError("无效的文件路径");
        }
        // 读取文件
        try {
            const fs = require('fs').promises;
            const content = await fs.readFile(params.path, 'utf8');
            return {
                success: true,
                content: content
            };
        }
        catch (error) {
            throw new ToolError_1.ToolError(`文件读取失败: ${error.message}`);
        }
    }
}
exports.FileReadTool = FileReadTool;
//# sourceMappingURL=FileReadTool.js.map