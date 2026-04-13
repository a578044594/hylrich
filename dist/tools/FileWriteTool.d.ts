import { EnhancedMCPTool } from './EnhancedMCPTool';
export declare class FileWriteTool extends EnhancedMCPTool {
    readonly name = "file_write";
    readonly description = "\u5199\u5165\u6587\u4EF6\u5185\u5BB9";
    readonly parameters: ToolInputJSONSchema;
    protected performExecution(input: {
        path: string;
        content: string;
    }): Promise<void>;
}
