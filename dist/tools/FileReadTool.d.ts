import { EnhancedMCPTool } from './EnhancedMCPTool';
export declare class FileReadTool extends EnhancedMCPTool {
    readonly name = "file_read";
    readonly description = "\u8BFB\u53D6\u6587\u4EF6\u5185\u5BB9";
    readonly parameters: any;
    protected performExecution(input: {
        path: string;
    }): Promise<string>;
}
