import { AgentScheduler } from '../../src/services/AgentScheduler';
import { MockEnhancedMCPTool } from '../tools/MockEnhancedMCPTool';

test('AgentScheduler should register and schedule tasks', () => {
  const scheduler = new AgentScheduler();
  const tool = new MockEnhancedMCPTool();
  
  scheduler.registerAgent({ name: 'test-agent', tool });
  
  const task = { input: 'test', priority: 1 };
  const result = scheduler.scheduleTask('test-agent', task);
  
  expect(result).resolves.toEqual(task);
});
