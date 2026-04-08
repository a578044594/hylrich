"use strict";
// 状态同步服务 - 集成gRPC进行分布式状态同步
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateSyncService = void 0;
const DistributedStateManager_1 = require("./DistributedStateManager");
const GrpcClient_1 = require("../../protocols/grpc/GrpcClient");
class StateSyncService {
    constructor(config) {
        this.isRunning = false;
        this.config = config;
        this.stateManager = new DistributedStateManager_1.DistributedStateManager(config.nodeId, {
            syncInterval: config.syncInterval || 3000
        });
        this.grpcClient = new GrpcClient_1.GrpcClient({
            host: config.grpcHost,
            port: config.grpcPort
        });
    }
    // 启动服务
    async start() {
        if (this.isRunning) {
            console.log('StateSyncService is already running');
            return;
        }
        try {
            // 测试gRPC连接
            const health = await this.grpcClient.healthCheck({});
            console.log('gRPC connection established:', health.status);
            this.stateManager.start();
            this.isRunning = true;
            console.log(`StateSyncService started for node: ${this.config.nodeId}`);
            // 开始状态同步循环
            this.startSyncLoop();
        }
        catch (error) {
            console.error('Failed to start StateSyncService:', error);
            throw error;
        }
    }
    // 停止服务
    async stop() {
        if (!this.isRunning) {
            return;
        }
        this.stateManager.stop();
        await this.grpcClient.close();
        this.isRunning = false;
        console.log('StateSyncService stopped');
    }
    // 状态同步循环
    startSyncLoop() {
        // 定期同步本地状态到其他节点
        setInterval(async () => {
            const states = Array.from(this.stateManager.states.entries());
            console.log(`同步 ${states.length} 个状态到其他节点...`);
            for (const [key, state] of states) {
                try {
                    await this.grpcClient.call('syncState', {
                        nodeId: this.config.nodeId,
                        state: {
                            key,
                            value: state.value,
                            version: state.version,
                            timestamp: state.timestamp
                        }
                    });
                }
                catch (error) {
                    console.error(`同步状态 ${key} 失败:`, error);
                }
            }
        }, this.config.syncInterval || 3000);
        // 定期从其他节点获取状态更新
        setInterval(async () => {
            console.log(`从其他节点获取状态更新...`);
            const nodes = this.stateManager.listNodes();
            for (const node of nodes) {
                if (node.id !== this.config.nodeId) {
                    try {
                        const remoteStates = await this.grpcClient.call('getStates', {
                            nodeId: this.config.nodeId
                        });
                        if (remoteStates && remoteStates.length > 0) {
                            for (const remoteState of remoteStates) {
                                const localState = this.stateManager.getState(remoteState.key);
                                if (!localState || remoteState.version > localState.version) {
                                    this.stateManager.processStateUpdate(remoteState);
                                }
                            }
                        }
                    }
                    catch (error) {
                        console.error(`从节点 ${node.id} 获取状态失败:`, error);
                    }
                }
            }
        }, this.config.syncInterval || 3000);
    }
    // 设置本地状态并广播
    async setState(key, value) {
        const update = this.stateManager.setState(key, value);
        // 广播到其他节点（模拟）
        console.log(`State updated: ${key} = ${JSON.stringify(value)}`);
        console.log('Broadcasting to other nodes...');
        return update;
    }
    // 获取本地状态
    getState(key) {
        return this.stateManager.getState(key);
    }
    // 处理来自其他节点的状态更新
    async processRemoteUpdate(update) {
        return this.stateManager.processStateUpdate(update);
    }
    // 获取服务状态
    getServiceStatus() {
        return {
            isRunning: this.isRunning,
            nodeId: this.config.nodeId,
            stats: this.stateManager.getStats(),
            grpcConnected: !!this.grpcClient
        };
    }
    // 注册其他节点
    registerRemoteNode(nodeInfo) {
        this.stateManager.registerNode({
            id: nodeInfo.id,
            host: nodeInfo.host,
            port: nodeInfo.port,
            status: 'online',
            capabilities: nodeInfo.capabilities || []
        });
    }
    // 发现其他节点（模拟）
    async discoverNodes() {
        console.log('Discovering other nodes...');
        // 模拟发现节点
        const mockNodes = [
            {
                id: 'node-2',
                host: '192.168.1.69',
                port: 50051,
                capabilities: ['state-sync', 'tools']
            },
            {
                id: 'node-3',
                host: '192.168.1.70',
                port: 50052,
                capabilities: ['state-sync', 'metrics']
            }
        ];
        for (const node of mockNodes) {
            this.registerRemoteNode(node);
        }
    }
}
exports.StateSyncService = StateSyncService;
//# sourceMappingURL=StateSyncService.js.map