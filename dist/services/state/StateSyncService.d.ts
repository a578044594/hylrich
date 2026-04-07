import { StateUpdate } from './DistributedStateManager';
export interface StateSyncServiceConfig {
    nodeId: string;
    grpcHost: string;
    grpcPort: number;
    syncInterval?: number;
}
export declare class StateSyncService {
    private stateManager;
    private grpcClient;
    private config;
    private isRunning;
    constructor(config: StateSyncServiceConfig);
    start(): Promise<void>;
    stop(): Promise<void>;
    private startSyncLoop;
    setState(key: string, value: any): Promise<StateUpdate>;
    getState(key: string): any;
    processRemoteUpdate(update: StateUpdate): Promise<boolean>;
    getServiceStatus(): any;
    registerRemoteNode(nodeInfo: any): void;
    discoverNodes(): Promise<void>;
}
