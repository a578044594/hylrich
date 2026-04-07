import { EnhancedMCPTool } from "./EnhancedMCPTool";
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
export declare class FileWriteTool extends EnhancedMCPTool {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            filePath: {
                type: string;
                description: string;
            };
            content: {
                type: string;
                description: string;
            };
            encoding: {
                type: string;
                enum: string[];
                default: string;
                description: string;
            };
        };
        required: string[];
        additionalProperties: boolean;
    };
    protected executeInternal(input: FileWriteInput): Promise<FileWriteOutput>;
}
