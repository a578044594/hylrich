import { HylrichCore } from './core/HylrichCore';

// 导出主要组件
export { HylrichCore };

// 启动系统
// AgentSystem and related protocols have been removed from this build
// Use HylrichCore directly for message processing
export function start(): void {
  console.log('HylrichCore is available for direct use');
}
