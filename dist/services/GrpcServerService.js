"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrpcServerService = void 0;
const GRPCService_1 = require("../protocols/grpc/GRPCService");
class GrpcServerService {
    constructor(stateStore, eventBus) {
        this.stateStore = stateStore;
        this.eventBus = eventBus;
    }
    async start(port = 50051) {
        this.grpcService = new GRPCService_1.GRPCService({
            port,
            stateStore: this.stateStore
        });
        await this.grpcService.start();
        console.log(`gRPC server (with StateSync) running on port ${port}`);
    }
    async stop() {
        if (this.grpcService) {
            await this.grpcService.stop();
        }
    }
}
exports.GrpcServerService = GrpcServerService;
//# sourceMappingURL=GrpcServerService.js.map