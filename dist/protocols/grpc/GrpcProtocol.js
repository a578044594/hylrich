"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrpcProtocol = void 0;
const grpc = __importStar(require("@grpc/grpc-js"));
class GrpcProtocol {
    constructor(config) {
        this.config = config;
        this.server = new grpc.Server();
    }
    async start() {
        return new Promise((resolve, reject) => {
            this.server.bindAsync(`${this.config.host}:${this.config.port}`, this.config.credentials || grpc.ServerCredentials.createInsecure(), (error, port) => {
                if (error) {
                    reject(error);
                }
                else {
                    console.log(`gRPC server started on port ${port}`);
                    resolve();
                }
            });
        });
    }
    async stop() {
        return new Promise((resolve, reject) => {
            this.server.tryShutdown((error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
    addService(service, implementation) {
        this.server.addService(service, implementation);
    }
}
exports.GrpcProtocol = GrpcProtocol;
//# sourceMappingURL=GrpcProtocol.js.map