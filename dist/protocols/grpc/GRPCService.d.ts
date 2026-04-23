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
     * 流式状态更新
     */
    private streamStateUpdates;
    /**
     * 发布状态变更
     */
    private publishState;
    /**
     * 获取当前状态快照
     */
    private getCurrentState;
    start(): Promise<void>;
    stop(): Promise<void>;
}
