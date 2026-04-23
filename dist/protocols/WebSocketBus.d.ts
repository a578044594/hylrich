export interface WebSocketConfig {
    url: string;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    heartbeatInterval?: number;
}
export declare class WebSocketBus {
    private config;
    private ws;
    private reconnectAttempts;
    private messageQueue;
    private isConnected;
    constructor(config: WebSocketConfig);
    connect(): Promise<void>;
    send(message: any): void;
    private processMessageQueue;
    private handleReconnect;
    private startHeartbeat;
    disconnect(): void;
}
