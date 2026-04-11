// Hylrich项目主入口

import { WebSocketBus } from './protocols/WebSocketBus';
import { GrpcProtocol } from './protocols/grpc/GrpcProtocol';
import { GrpcClient } from './protocols/grpc/GrpcClient';
import { EnhancedMCPTool } from './protocols/EnhancedMCPTool';
import { AgentSystem } from './services/AgentSystem';

// 导出主要组件
export {
  WebSocketBus,
  GrpcProtocol,
  GrpcClient,
  EnhancedMCPTool,
  AgentSystem
};

// 启动系统
export function start(): void {
  console.log('Hylrich系统启动中...');
  
  const agentSystem = new AgentSystem();
  agentSystem.start();
  
  console.log('Hylrich系统启动完成');
}
