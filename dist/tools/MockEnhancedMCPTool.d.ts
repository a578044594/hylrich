import { EnhancedMCPTool } from './EnhancedMCPTool';
export declare class MockEnhancedMCPTool extends EnhancedMCPTool {
    readonly name = "mock_tool";
    readonly description = "\u6A21\u62DF\u5DE5\u5177";
    readonly parameters: ToolInputJSONSchema;
    protected performExecution(input: {
        message: string;
    }): Promise<string>;
}
