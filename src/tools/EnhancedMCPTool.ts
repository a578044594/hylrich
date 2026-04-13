import { Tool, ToolInputJSONSchema } from '../core/Tool';

export interface MCPExecutionMetrics {
  startTime: number;
  endTime?: number;
  success?: boolean;
  error?: string;
  executionTime?: number;
}

export abstract class EnhancedMCPTool extends Tool {
  protected executionHistory: MCPExecutionMetrics[] = [];
  protected executionCount: number = 0;

  constructor() {
    super();
  }

  protected recordExecution(metrics: MCPExecutionMetrics): void {
    this.executionHistory.push(metrics);
    this.executionCount++;
    
    // 保持历史记录大小
    if (this.executionHistory.length > 50) {
      this.executionHistory.shift();
    }
  }

  public getPerformanceStats(): {
    totalExecutions: number;
    errorCount: number;
    errorRate: number;
    successRate: number;
    averageExecutionTime: number;
  } {
    const successfulExecutions = this.executionHistory.filter(m => m.success).length;
    const failedExecutions = this.executionHistory.filter(m => m.success === false).length;
    const totalTime = this.executionHistory.reduce((sum, m) => sum + (m.executionTime || 0), 0);
    
    return {
      totalExecutions: this.executionCount,
      errorCount: failedExecutions,
      errorRate: this.executionCount > 0 ? (failedExecutions / this.executionCount) * 100 : 0,
      successRate: this.executionCount > 0 ? (successfulExecutions / this.executionCount) * 100 : 0,
      averageExecutionTime: this.executionCount > 0 ? totalTime / this.executionCount : 0
    };
  }

  protected abstract performExecution(input: any): Promise<any>;

  public async execute(input: any): Promise<any> {
    const startTime = Date.now();
    let success: boolean | undefined;
    let error: string | undefined;

    try {
      console.log(`🔧 执行增强MCP工具: ${this.name}`);
      const result = await this.performExecution(input);
      success = true;
      
      const endTime = Date.now();
      this.recordExecution({
        startTime,
        endTime,
        success,
        executionTime: endTime - startTime
      });

      console.log(`✅ 工具执行完成: ${this.name}`);
      return result;
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : String(err);
      
      const endTime = Date.now();
      this.recordExecution({
        startTime,
        endTime,
        success,
        error,
        executionTime: endTime - startTime
      });

      console.error(`❌ 工具执行失败: ${this.name}`, error);
      throw err;
    }
  }
}
