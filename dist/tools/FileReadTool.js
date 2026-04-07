"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileReadTool = void 0;
const EnhancedMCPTool_1 = require("./EnhancedMCPTool");
const promises_1 = __importDefault(require("fs/promises"));
class FileReadTool extends EnhancedMCPTool_1.EnhancedMCPTool {
    constructor() {
        super(...arguments);
        this.name = "file_read";
        this.description = "读取文件内容工具";
        this.parameters = {
            type: "object",
            properties: {
                filePath: {
                    type: "string",
                    description: "文件路径"
                },
                encoding: {
                    type: "string",
                    enum: ["utf8", "utf16le", "latin1", "base64", "hex", "ascii"],
                    default: "utf8",
                    description: "文件编码"
                }
            },
            required: ["filePath"],
            additionalProperties: false
        };
    }
    async executeInternal(input) {
        const { filePath, encoding = "utf8" } = input;
        // 验证文件路径
        if (!filePath || typeof filePath !== "string") {
            throw new Error("文件路径必须是非空字符串");
        }
        // 安全检查：防止路径遍历攻击
        if (filePath.includes("..") || filePath.startsWith("/")) {
            throw new Error("无效的文件路径");
        }
        try {
            const content = await promises_1.default.readFile(filePath, { encoding: encoding });
            const stats = await promises_1.default.stat(filePath);
            return {
                content,
                fileSize: stats.size,
                encoding: encoding
            };
        }
        catch (error) {
            if (error.code === "ENOENT") {
                throw new Error(`文件不存在: ${filePath}`);
            }
            else if (error.code === "EACCES") {
                throw new Error(`没有权限读取文件: ${filePath}`);
            }
            else {
                throw new Error(`读取文件失败: ${error.message}`);
            }
        }
    }
}
exports.FileReadTool = FileReadTool;
//# sourceMappingURL=FileReadTool.js.map