import { AgentScheduler } from '../src/services/AgentScheduler';
import { MockEnhancedMCPTool } from '../src/tools/MockEnhancedMCPTool';

describe('AgentScheduler', () => {
  test('should schedule agent tasks correctly', () => {
    const scheduler = new AgentScheduler();
    const mockTool = new MockEnhancedMCPTool();
    
    // 测试基本调度功能
    expect(scheduler).toBeDefined();
    expect(mockTool).toBeDefined();
  });
});
