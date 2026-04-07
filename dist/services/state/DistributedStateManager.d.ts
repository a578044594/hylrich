import { EventEmitter } from 'events';
export interface StateUpdate {
    key: string;
    value: any;
    nodeId: string;
    version: number;
    timestamp: number;
}
export interface NodeInfo {
    id: string;
    host: string;
    port: number;
    status: 'online' | 'offline' | 'error';
    capabilities: string[];
}
export interface StateStats {
    totalStates: number;
    localUpdates: number;
    remoteUpdates: number;
}
export declare class DistributedStateManager extends EventEmitter {
    private nodeId;
    private states;
    private remoteStates;
    private nodes;
    private versionCounter;
    private syncInterval;
    constructor(nodeId: string, config?: {
        syncInterval?: number;
    });
    start(): void;
    stop(): void;
    setNodeId(nodeId: string): void;
    getNodeId(): string;
    setState(key: string, value: any): StateUpdate;
    getState(key: string): any;
    processStateUpdate(update: StateUpdate): boolean;
    registerNode(nodeInfo: NodeInfo): void;
    unregisterNode(nodeId: string): boolean;
    listNodes(): NodeInfo[];
    getStats(): StateStats;
}
