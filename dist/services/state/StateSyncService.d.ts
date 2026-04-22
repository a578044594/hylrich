import { EventEmitter } from 'events';
export interface StateSnapshot {
    timestamp: number;
    data: any;
}
export declare class StateSyncService extends EventEmitter {
    private states;
    constructor();
    start(): Promise<void>;
    stop(): Promise<void>;
    saveState(key: string, value: any): Promise<void>;
    loadState(key: string): Promise<any>;
    getAllStates(): Promise<Map<string, any>>;
}
