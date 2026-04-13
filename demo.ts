import { AgentSystem } from './src/services/AgentSystem';
import { MockEnhancedMCPTool } from './tools/MockEnhancedMCPTool';

async function demo() {
  console.log('🎬 Hylrich AI Agent 系统演示');
  
  // 创建系统实例
  const system = new AgentSystem();
  
  try {
    // 启动系统
    await system.start();
    
    // 检查系统状态
    const status = system.getStatus();
    console.log('📊 系统状态:', status);
    
    // 执行健康检查
    const health = await system.healthCheck();
    console.log('🏥 健康检查:', health);
    
    // 创建并注册模拟工具
    const mockTool = new MockEnhancedMCPTool();
    await system.registerTool(mockTool);
    
    // 执行工具调用
    const result = await system.executeTool('mock_tool', { message: 'Hello Hylrich!' });
    console.log('🔧 工具执行结果:', result);
    
    // 通过WebSocket发送消息
    await system.sendMessage({
      type: 'test_message',
      payload: 'WebSocket消息测试',
      timestamp: new Date().toISOString()
    });
    
    // 等待一段时间
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 停止系统
    await system.stop();
    
    console.log('✅ 演示完成');
    
  } catch (error) {
    console.error('❌ 演示失败:', error);
  }
}

// 运行演示
demo().catch(console.error);
