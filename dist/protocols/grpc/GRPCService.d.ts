import { DistributedStateStore } from '../../state/DistributedStateStore';
export interface GRPCServiceConfig {
    port: number;
    protoPath?: string;
    stateStore?: DistributedStateStore;
}
export declare class GRPCService {
    private server;
    private config;
    private stateStore?;
    constructor(config: GRPCServiceConfig);
    private setupServices;
    private executeTool;
    private getSystemHealth;
    private streamMetrics;
    /**
     * 流式状态更新 - 客户端订阅状态变更
     * 实现：客户端发起流，服务端推送状态变更
     */
    private streamStateUpdates;
    /**
     * 发布状态变更 - 客户端发送状态更新
     * 实现：客户端发送单个状态更新，服务端合并到本地状态并转发
     */
    private publishState;
    /**
     * 获取当前状态快照
     */
    private getCurrentState;
    start(): Promise<void>;
    stop(): Promise<void>;
}
