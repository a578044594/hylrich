import { EventEmitter } from '../../core/EventEmitter';
export interface GrpcClientConfig {
    host: string;
    port: number;
}
export declare class GrpcClient extends EventEmitter {
    private config;
    private isConnected;
    constructor(config: GrpcClientConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    executeTool(toolName: string, input: any): Promise<any>;
    isConnected(): boolean;
}
