import { Tool } from '../core/Tool';
export declare class EnhancedMCPTool extends Tool {
    name: string;
    description: string;
    parameters: {
        type: "object";
        properties: {
            action: {
                type: string;
            };
            data: {
                type: string;
            };
        };
        required: string[];
    };
    protected performExecution(input: any): Promise<any>;
}
