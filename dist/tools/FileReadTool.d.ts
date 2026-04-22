import { Tool } from '../core/Tool';
export declare class FileReadTool extends Tool {
    readonly name = "file_read";
    readonly description = "\u8BFB\u53D6\u6587\u4EF6\u5185\u5BB9";
    readonly parameters: any;
    protected performExecution(input: {
        path: string;
    }): Promise<string>;
}
