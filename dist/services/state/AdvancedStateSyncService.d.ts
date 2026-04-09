import { StateUpdate, NodeInfo } from './DistributedStateManager';
import { EventEmitter } from 'events';
export interface AdvancedStateSyncConfig {
    nodeId: string;
    syncInterval?: number;
    conflictResolution?: 'last-write-wins' | 'version-based' | 'custom';
    replicationFactor?: number;
}
export interface ClusterNode extends NodeInfo {
    lastHeartbeat: number;
    latency?: number;
}
export interface SyncStrategy {
    name: string;
    shouldReplicate(update: StateUpdate, targetNode: ClusterNode): boolean;
    resolveConflict(local: StateUpdate, remote: StateUpdate): StateUpdate;
}
export declare class AdvancedStateSyncService extends EventEmitter {
    private stateManager;
    private config;
    private clusterNodes;
    private syncStrategies;
    private isRunning;
    private syncIntervalId?;
    constructor(config: AdvancedStateSyncConfig);
    start(): Promise<void>;
    stop(): Promise<void>;
    private registerDefaultStrategies;
    registerSyncStrategy(name: string, strategy: SyncStrategy): boolean;
    private setupEventHandlers;
    private startSyncLoop;
    private startHeartbeatCheck;
    private performFullSync;
    private replicateUpdate;
    private selectReplicationTargets;
    private checkNodeHealth;
    addClusterNode(nodeInfo: ClusterNode): boolean;
    removeClusterNode(nodeId: string): boolean;
    updateNodeHeartbeat(nodeId: string): boolean;
    getClusterStats(): {
        totalNodes: number;
        onlineNodes: number;
        offlineNodes: number;
        replicationFactor: number;
    };
    setState(key: string, value: any): StateUpdate;
    getState(key: string): any;
    processStateUpdate(update: StateUpdate): boolean;
    registerNode(nodeInfo: NodeInfo): void;
    unregisterNode(nodeId: string): boolean;
    listNodes(): NodeInfo[];
    getStats(): import("./DistributedStateManager").StateStats;
    getServiceStatus(): {
        isRunning: boolean;
        nodeId: string;
        clusterStats: {
            totalNodes: number;
            onlineNodes: number;
            offlineNodes: number;
            replicationFactor: number;
        };
        syncStrategy: "last-write-wins" | "version-based" | "custom" | undefined;
        clusterNodes: ClusterNode[];
    };
}
