import { Tool } from '../core/Tool';
import { MCPExecutionMetrics } from '../types/MCPExecutionMetrics';

export interface ToolParameters {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stopSequences?: string[];
  other?: Record<string, any>;
}

export abstract class EnhancedMCPTool extends Tool {
  private executionHistory: MCPExecutionMetrics[] = [];
  private maxHistorySize = 50;
  
  async execute(input: any): Promise<any> {
    const metrics: MCPExecutionMetrics = {
      startTime: Date.now(),
      memoryUsage: process.memoryUsage().heapUsed
    };
    
    try {
      const result = await this.executeInternal(input);
      metrics.endTime = Date.now();
      metrics.success = true;
      this.recordExecution(metrics.startTime, metrics.endTime);
      this.addToHistory(metrics);
      return result;
    } catch (error) {
      metrics.endTime = Date.now();
      metrics.success = false;
      metrics.error = error;
      this.addToHistory(metrics);
      throw error;
    }
  }
  
  protected abstract executeInternal(input: any): Promise<any>;
  
  private addToHistory(metrics: MCPExecutionMetrics): void {
    this.executionHistory.unshift(metrics);
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory.pop();
    }
  }
  
  public getExecutionHistory(): MCPExecutionMetrics[] {
    return [...this.executionHistory];
  }
  
  public getPerformanceReport() {
    const stats = this.getPerformanceStats();
    const successful = this.executionHistory.filter(m => m.success).length;
    const failed = this.executionHistory.filter(m => !m.success).length;
    
    return {
      totalExecutions: stats.executionCount,
      successRate: stats.executionCount > 0 
        ? (successful / stats.executionCount) * 100 
        : 0,
      averageExecutionTime: stats.averageExecutionTime,
      recentHistory: this.executionHistory.slice(0, 10)
    };
  }
}

// Mock implementation for testing
class MockEnhancedMCPTool extends EnhancedMCPTool {
  name = 'mock-enhanced-mcp-tool';
  description = 'A mock tool for testing EnhancedMCPTool';
  
  parameters: ToolParameters = {
    model: 'test-model',
    maxTokens: 100,
    temperature: 0.7,
    topP: 0.9,
    stopSequences: ['end'],
    other: { test: 'value' }
  };
  
  protected async executeInternal(input: any): Promise<any> {
    return input; // Simply return the input for testing
  }
}
