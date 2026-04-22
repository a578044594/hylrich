import { Tool } from './types/Tool';
export interface HylrichInput {
    message: string;
    context?: any;
}
export interface HylrichOutput {
    reply: string;
    tools?: any[];
    timestamp: string;
    error?: string;
}
export declare class HylrichCore {
    private tools;
    private openai;
    constructor();
    registerTool(tool: Tool): void;
    processMessage(input: string, context?: any): Promise<HylrichOutput>;
}
