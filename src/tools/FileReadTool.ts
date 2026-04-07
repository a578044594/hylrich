import { EnhancedMCPTool } from "./EnhancedMCPTool";
import fs from "fs/promises";

export interface FileReadInput {
  filePath: string;
  encoding?: BufferEncoding;
}

export interface FileReadOutput {
  content: string;
  fileSize: number;
  encoding: BufferEncoding;
}

export class FileReadTool extends EnhancedMCPTool {
  name = "file_read";
  description = "读取文件内容工具";
  parameters = {
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
  
  protected async executeInternal(input: FileReadInput): Promise<FileReadOutput> {
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
      const content = await fs.readFile(filePath, { encoding: encoding as BufferEncoding });
      const stats = await fs.stat(filePath);
      
      return {
        content,
        fileSize: stats.size,
        encoding: encoding as BufferEncoding
      };
    } catch (error: unknown) {
      const err = error as { code?: string; message: string };
      if (err.code === "ENOENT") {
        throw new Error(`文件不存在: ${filePath}`);
      } else if (err.code === "EACCES") {
        throw new Error(`没有权限读取文件: ${filePath}`);
      } else {
        throw new Error(`读取文件失败: ${err.message}`);
      }
    }
  }
}
