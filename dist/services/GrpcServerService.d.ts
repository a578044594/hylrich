import { DistributedStateStore } from '../state/DistributedStateStore';
import { EventBus } from '../core/EventBus';
export declare class GrpcServerService {
    private grpcService?;
    private stateStore;
    private eventBus;
    constructor(stateStore: DistributedStateStore, eventBus: EventBus);
    start(port?: number): Promise<void>;
    stop(): Promise<void>;
}
