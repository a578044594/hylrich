"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileWriteTool = void 0;
const EnhancedMCPTool_1 = require("../tools/EnhancedMCPTool");
const ToolError_1 = require("../core/ToolError");
class FileWriteTool extends EnhancedMCPTool_1.EnhancedMCPTool {
    async executeInternal(params) {
        // 验证输入
        if (!params.path || typeof params.path !== "string") {
            throw new ToolError_1.ToolError("文件路径必须是非空字符串");
        }
        if (!params.content || typeof params.content !== "string") {
            throw new ToolError_1.ToolError("文件内容必须是非空字符串");
        }
        // 安全检查：防止路径遍历攻击
        const normalizedPath = params.path.replace(/\\/g, '/');
        if (normalizedPath.includes('..') || normalizedPath.startsWith('.')) {
            throw new ToolError_1.ToolError("无效的文件路径");
        }
        // 写入文件
        try {
            await this.writeFile(params.path, params.content);
        }
        catch (error) {
            throw new ToolError_1.ToolError(`文件写入失败: ${error.message}`);
        }
        return {
            success: true,
            path: params.path
        };
    }
    async writeFile(path, content) {
        // 实现文件写入逻辑
        // 这里使用fs模块写入文件
        const fs = require('fs').promises;
        await fs.writeFile(path, content, 'utf8');
    }
}
exports.FileWriteTool = FileWriteTool;
//# sourceMappingURL=FileWriteTool.js.map