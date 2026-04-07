"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileWriteTool = void 0;
const EnhancedMCPTool_1 = require("./EnhancedMCPTool");
const promises_1 = __importDefault(require("fs/promises"));
class FileWriteTool extends EnhancedMCPTool_1.EnhancedMCPTool {
    constructor() {
        super(...arguments);
        this.name = "file_write";
        this.description = "写入文件内容工具";
        this.parameters = {
            type: "object",
            properties: {
                filePath: {
                    type: "string",
                    description: "文件路径"
                },
                content: {
                    type: "string",
                    description: "要写入的内容"
                },
                encoding: {
                    type: "string",
                    enum: ["utf8", "utf16le", "latin1", "base64", "hex", "ascii"],
                    default: "utf8",
                    description: "文件编码"
                }
            },
            required: ["filePath", "content"],
            additionalProperties: false
        };
    }
    async executeInternal(input) {
        const { filePath, content, encoding = "utf8" } = input;
        // 输入验证
        if (!filePath || typeof filePath !== "string") {
            throw new Error("文件路径必须是非空字符串");
        }
        if (typeof content !== "string") {
            throw new Error("内容必须是字符串");
        }
        // 安全检查
        if (filePath.includes("..") || filePath.startsWith("/")) {
            throw new Error("无效的文件路径");
        }
        try {
            await promises_1.default.writeFile(filePath, content, { encoding: encoding });
            return {
                success: true,
                filePath,
                bytesWritten: Buffer.byteLength(content, encoding)
            };
        }
        catch (error) {
            if (error.code === "EACCES") {
                throw new Error(`没有权限写入文件: ${filePath}`);
            }
            else {
                throw new Error(`写入文件失败: ${error.message}`);
            }
        }
    }
}
exports.FileWriteTool = FileWriteTool;
//# sourceMappingURL=FileWriteTool.js.map