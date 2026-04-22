import { WebSocketBus } from './protocols/websocket/WebSocketBus';
import { GrpcProtocol } from './protocols/grpc/GrpcProtocol';
import { GrpcClient } from './protocols/grpc/GrpcClient';
import { EnhancedMCPTool } from './protocols/EnhancedMCPTool';
import { AgentSystem } from './services/AgentSystem';
import { HylrichCore } from './core/HylrichCore';

// 导出主要组件
export {
  WebSocketBus,
  GrpcProtocol,
  GrpcClient,
  EnhancedMCPTool,
  AgentSystem,
  HylrichCore
};

// 启动系统
export function start(): void {
  console.log('Hylrich系统启动中...');
  
  const agentSystem = new AgentSystem();
  agentSystem.start();
  
  console.log('Hylrich系统启动完成');
}
