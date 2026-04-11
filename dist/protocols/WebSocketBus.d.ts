import { EventEmitter } from '../core/EventEmitter';
export interface WebSocketConfig {
    url: string;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
}
export interface WebSocketMessage {
    type: string;
    data: any;
    timestamp: number;
}
export declare class WebSocketBus extends EventEmitter {
    private ws;
    private config;
    private reconnectAttempts;
    private messageQueue;
    private isConnected;
    constructor(config: WebSocketConfig);
    connect(): Promise<void>;
    send(message: WebSocketMessage): void;
    private processMessageQueue;
    private handleReconnect;
    disconnect(): void;
    getConnectionStatus(): {
        connected: boolean;
        reconnectAttempts: number;
    };
}
