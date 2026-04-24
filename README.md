# Hylrich Agent System

一个基于 TypeScript 的 Agent 管理系统，当前提供：

- HTTP API（健康检查、状态、Agent 管理、工具执行、聊天）
- gRPC 服务（工具执行、健康检查、指标流、状态同步）
- 分布式状态存储（本地状态 + 事件同步）
- OpenAI Agent 基础对话能力
- 文件读写工具（`file_read` / `file_write`）
  - 默认启用 `TOOL_ROOT_DIR` 沙箱边界，防止越界读写

---

## 当前状态（2026-04）

项目已具备可运行主链路，并补充了 smoke 测试用于真实接口验证。

已落地：

- `typecheck`：类型检查
- `build`：构建并复制 proto
- `smoke`：启动服务并验证 `/health`、`/status`、`/agents`、`/tool`

仍在持续优化：

- gRPC 观测指标真实性（当前 `StreamMetrics` 仍为模拟值）
- 分布式状态同步一致性与冲突策略
- 工具层安全沙箱（路径白名单、权限边界）
- 文档与测试覆盖率进一步完善

---

## 快速开始

### 1) 安装依赖

```bash
npm install
```

### 2) 类型检查

```bash
npm run typecheck
```

### 3) 构建

```bash
npm run build
```

### 4) 启动服务

```bash
npm start
```

可通过环境变量指定地址：

```bash
HOST=127.0.0.1 PORT=8090 npm start
```

文件工具安全根目录（可选，默认当前工作目录）：

```bash
TOOL_ROOT_DIR=/workspace/hylrich/data npm start
```

### 5) 运行冒烟测试（推荐）

```bash
npm run smoke
```

---

## HTTP API

默认地址：`http://0.0.0.0:8090`

- `GET /health`
- `GET /status`
- `GET /agents`
- `POST /agents`
- `POST /tool`
- `POST /chat`

---

## 目录结构（核心）

```text
src/
  core/                 # 核心编排层
  entrypoints/server.ts # HTTP 入口
  protocols/grpc/       # gRPC 协议层
  services/             # AgentSystem / OpenAI / ToolRegistry
  state/                # 分布式状态存储
  tools/                # 文件工具
protos/agent.proto      # gRPC 协议定义
scripts/build.sh
scripts/smoke-test.sh
```

---

## 后续开发阶段（执行中）

### Phase A（当前重点）

- 协议与实现收敛（减少 mock，增强真实执行）
- 启动生命周期显式化（`start/stop`）
- 测试分层（core / integration / smoke）

### Phase B

- 指标与健康检查真实化
- 状态同步一致性增强（冲突与重放策略）
- 错误处理标准化（重试、超时、降级）

### Phase C

- 工具安全沙箱
- Agent 工具调用策略层（tool-calling）
- 生产化部署与可观测性完善

---

## 脚本

- `npm run typecheck`
- `npm run build`
- `npm run dev`
- `npm test`
- `npm run test:core`
- `npm run smoke`
