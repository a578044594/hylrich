import { EventEmitter } from '../../core/EventEmitter';
export interface GrpcConfig {
    port: number;
}
export declare class GrpcProtocol extends EventEmitter {
    private config;
    private isRunning;
    constructor(config: GrpcConfig);
    start(): Promise<void>;
    stop(): Promise<void>;
    isRunning(): boolean;
}
