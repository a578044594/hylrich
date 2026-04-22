export declare class GRPCService {
    private server;
    private port;
    private isRunning;
    constructor(port?: number);
    private setupServices;
    start(): Promise<void>;
    stop(): Promise<void>;
    isServiceRunning(): boolean;
}
