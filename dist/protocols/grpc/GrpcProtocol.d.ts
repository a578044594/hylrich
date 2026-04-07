import * as grpc from '@grpc/grpc-js';
export interface GrpcServerConfig {
    host: string;
    port: number;
    credentials?: grpc.ServerCredentials;
}
export declare class GrpcProtocol {
    private server;
    private config;
    constructor(config: GrpcServerConfig);
    start(): Promise<void>;
    stop(): Promise<void>;
    addService(service: grpc.ServiceDefinition, implementation: grpc.UntypedServiceImplementation): void;
}
