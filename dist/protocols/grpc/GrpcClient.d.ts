import * as grpc from '@grpc/grpc-js';
export interface GrpcClientConfig {
    host: string;
    port: number;
    credentials?: grpc.ChannelCredentials;
}
export declare class GrpcClient {
    private client;
    private config;
    constructor(config: GrpcClientConfig);
    private setupClient;
    executeTool(toolName: string, input: any): Promise<any>;
    getSystemHealth(): Promise<any>;
    streamMetrics(intervalMs: number | undefined, callback: (metrics: any) => void): () => void;
    /**
     * 流式接收状态更新
     * @param callback 接收状态更新
     * @returns 取消订阅函数
     */
    streamStateUpdates(callback: (update: any) => void): () => void;
    /**
     * 发布状态变更
     */
    publishState(key: string, value: any, source: string): Promise<boolean>;
    /**
     * 获取当前状态快照
     */
    getCurrentState(filterPrefix?: string): Promise<Record<string, any>>;
    close(): void;
}
