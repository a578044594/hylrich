import { EnhancedMCPTool } from "./EnhancedMCPTool";
import fs from "fs/promises";

export interface FileWriteInput {
  filePath: string;
  content: string;
  encoding?: BufferEncoding;
}

export interface FileWriteOutput {
  success: boolean;
  filePath: string;
  bytesWritten: number;
}

export class FileWriteTool extends EnhancedMCPTool {
  name = "file_write";
  description = "写入文件内容工具";
  parameters = {
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
  
  protected async executeInternal(input: FileWriteInput): Promise<FileWriteOutput> {
    const { filePath, content, encoding = "utf8" } = input;
    
    // 验证输入
    if (!filePath || typeof filePath !== "string") {
      throw new Error("文件路径必须是非空字符串");
    }
    
    if (!content || typeof content !== "string") {
      throw new Error("内容必须是非空字符串");
    }
    
    // 安全检查：防止路径遍历攻击
    if (filePath.includes("..") || filePath.startsWith("/")) {
      throw new Error("无效的文件路径");
    }
    
    try {
      await fs.writeFile(filePath, content, { encoding: encoding as BufferEncoding });
      const stats = await fs.stat(filePath);
      
      return {
        success: true,
        filePath,
        bytesWritten: stats.size
      };
    } catch (error: unknown) {
      const err = error as { code?: string; message: string };
      if (err.code === "EACCES") {
        throw new Error(`没有权限写入文件: ${filePath}`);
      } else {
        throw new Error(`写入文件失败: ${err.message}`);
      }
    }
  }
}
