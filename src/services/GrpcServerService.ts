import { GRPCService } from '../protocols/grpc/GRPCService';
import { DistributedStateStore } from '../state/DistributedStateStore';
import { EventBus } from '../core/EventBus';
import { ToolRegistry } from './ToolRegistry';

export class GrpcServerService {
  private grpcService?: GRPCService;
  private stateStore: DistributedStateStore;
  private eventBus: EventBus;
  private toolRegistry: ToolRegistry;
  
  constructor(stateStore: DistributedStateStore, eventBus: EventBus, toolRegistry: ToolRegistry) {
    this.stateStore = stateStore;
    this.eventBus = eventBus;
    this.toolRegistry = toolRegistry;
  }

  async start(port: number = 50051): Promise<void> {
    this.grpcService = new GRPCService({
      port,
      stateStore: this.stateStore,
      toolExecutor: async (toolName: string, input: any) => this.toolRegistry.execute(toolName, input)
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
