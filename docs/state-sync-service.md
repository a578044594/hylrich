# StateSyncService - 分布式状态同步服务

## 📖 概述

`StateSyncService` 是一个基于 gRPC 的分布式状态同步服务，支持多节点之间的状态自动同步和冲突解决。

## 🚀 快速开始

### 安装和配置

```typescript
import { StateSyncService } from './src/services/state/StateSyncService';

const config = {
  nodeId: 'node-1',
  grpcHost: 'localhost',
  grpcPort: 50051,
  syncInterval: 3000 // 同步间隔，默认 3 秒
};

const service = new StateSyncService(config);
```

### 启动服务

```typescript
// 启动状态同步服务
await service.start();

// 设置状态（会自动同步到其他节点）
await service.setState('user.preferences', { theme: 'dark', language: 'zh' });

// 获取状态
const preferences = service.getState('user.preferences');
```

## 📋 API 参考

### StateSyncService(config: StateSyncServiceConfig)

构造函数，创建状态同步服务实例。

**配置选项:**
- `nodeId: string` - 当前节点 ID
- `grpcHost: string` - gRPC 服务器地址
- `grpcPort: number` - gRPC 服务器端口
- `syncInterval?: number` - 同步间隔（毫秒，默认 3000）

### async start(): Promise<void>

启动状态同步服务，建立 gRPC 连接并开始同步循环。

### async stop(): Promise<void>

停止状态同步服务，关闭连接并清理资源。

### async setState(key: string, value: any): Promise<StateUpdate>

设置本地状态并自动同步到其他节点。

### getState(key: string): any

获取本地状态值。

### async processRemoteUpdate(update: StateUpdate): Promise<boolean>

处理来自其他节点的状态更新。

### getServiceStatus(): any

获取服务运行状态和统计信息。

### registerRemoteNode(nodeInfo: any): void

注册远程节点信息。

### async discoverNodes(): Promise<void>

发现其他节点（模拟功能）。

## 🎯 核心特性

### 双向状态同步
- **本地 → 远程**: 定期将本地状态同步到其他节点
- **远程 → 本地**: 定期从其他节点获取状态更新

### 智能冲突解决
- **版本控制**: 基于版本号的冲突检测
- **时间戳优先**: Last-Write-Wins 策略
- **自动合并**: 自动选择最新版本的状态

### 错误恢复机制
- **自动重试**: 网络错误时自动重试
- **连接监控**: 实时监控 gRPC 连接状态
- **优雅降级**: 网络中断时继续本地操作

## ⚙️ 配置示例

### 基本配置
```typescript
const config = {
  nodeId: 'production-node-1',
  grpcHost: 'grpc.example.com',
  grpcPort: 50051,
  syncInterval: 5000 // 5 秒同步间隔
};
```

### 多节点配置
```typescript
// 节点 1
const service1 = new StateSyncService({
  nodeId: 'node-1',
  grpcHost: '192.168.1.100',
  grpcPort: 50051
});

// 节点 2  
const service2 = new StateSyncService({
  nodeId: 'node-2',
  grpcHost: '192.168.1.101',
  grpcPort: 50051
});
```

## 🔧 最佳实践

### 性能优化
1. **调整同步间隔**: 根据业务需求设置合适的同步频率
2. **状态分组**: 将相关状态分组减少同步次数
3. **增量更新**: 只同步变化的状态字段

### 错误处理
```typescript
try {
  await service.setState('important.data', data);
} catch (error) {
  console.error('状态设置失败:', error);
  // 本地缓存，等待重试
}
```

### 监控和日志
```typescript
// 监听状态更新事件
service.on('stateUpdate', (update) => {
  console.log('状态更新:', update);
});

// 监听节点事件
service.on('nodeRegistered', (nodeInfo) => {
  console.log('节点注册:', nodeInfo);
});
```

## 🐛 故障排除

### 常见问题

**Q: gRPC 连接失败**
A: 检查网络连接和 gRPC 服务器状态

**Q: 状态同步延迟**
A: 调整 syncInterval 或检查网络带宽

**Q: 版本冲突**
A: 确保所有节点时钟同步，检查冲突解决逻辑

**Q: 内存使用过高**
A: 清理不再需要的状态，调整状态保留策略

### 日志分析

服务会输出详细的日志信息：
- `gRPC connection established` - 连接建立成功
- `同步 X 个状态到其他节点` - 同步操作开始
- `同步状态 KEY 失败` - 单个状态同步失败
- `从节点 ID 获取状态失败` - 节点通信失败

## 📊 性能指标

服务提供以下统计信息：
- 总状态数量
- 本地更新次数
- 远程更新次数
- 节点连接状态

## 🔗 相关链接

- [gRPC 客户端文档](./grpc-client.md)
- [分布式状态管理器](./distributed-state-manager.md)
- [监控服务](./monitoring-service.md)

---

**版本:** 1.0.0  
**最后更新:** 2026-04-07
