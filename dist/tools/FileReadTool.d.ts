import { EnhancedMCPTool } from "./EnhancedMCPTool";
export interface FileReadInput {
    filePath: string;
    encoding?: BufferEncoding;
}
export interface FileReadOutput {
    content: string;
    fileSize: number;
    encoding: BufferEncoding;
}
export declare class FileReadTool extends EnhancedMCPTool {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            filePath: {
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
    protected executeInternal(input: FileReadInput): Promise<FileReadOutput>;
}
