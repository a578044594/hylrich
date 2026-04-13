export declare class WebSocketBus {
    private port;
    private server;
    private clients;
    private _isRunning;
    constructor(port?: number);
    get isRunning(): boolean;
    start(): Promise<void>;
    stop(): Promise<void>;
    send(message: any): Promise<void>;
    broadcast(message: any): Promise<void>;
}
