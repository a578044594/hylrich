import { GRPCService } from '../protocols/grpc/GRPCService';
import { DistributedStateStore } from '../state/DistributedStateStore';
import { EventBus } from '../core/EventBus';

export class GrpcServerService {
  private grpcService?: GRPCService;
  private stateStore: DistributedStateStore;
  private eventBus: EventBus;
  
  constructor(stateStore: DistributedStateStore, eventBus: EventBus) {
    this.stateStore = stateStore;
    this.eventBus = eventBus;
  }

  async start(port: number = 50051): Promise<void> {
    this.grpcService = new GRPCService({
      port,
      stateStore: this.stateStore
    });
    
    await this.grpcService.start();
    console.log(`gRPC server (with StateSync) running on port ${port}`);
  }

  async stop(): Promise<void> {
    if (this.grpcService) {
      await this.grpcService.stop();
    }
  }
}
