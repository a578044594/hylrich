import { ToolError, ToolExecutionError, ToolValidationError } from './ToolError';

export interface ToolInputJSONSchema {
  type: 'object';
  properties: Record<string, any>;
  required?: string[];
}

export interface ToolExecutionMetrics {
  startTime: number;
  endTime?: number;
  success: boolean;
  error?: Error;
}

export abstract class Tool {
  abstract name: string;
  abstract description: string;
  abstract parameters: ToolInputJSONSchema;
  
  private executionCount: number = 0;
  private errorCount: number = 0;
  private executionHistory: ToolExecutionMetrics[] = [];

  async execute(input: any): Promise<any> {
    const startTime = Date.now();
    const metrics: ToolExecutionMetrics = {
      startTime,
      success: false
    };

    try {
      this.executionCount++;
      
      // 验证输入
      this.validateInput(input);
      
      // 执行工具逻辑
      const result = await this.performExecution(input);
      
      metrics.endTime = Date.now();
      metrics.success = true;
      
      this.executionHistory.push(metrics);
      
      return result;
    } catch (error) {
      this.errorCount++;
      metrics.endTime = Date.now();
      metrics.error = error as Error;
      
      this.executionHistory.push(metrics);
      
      throw error;
    }
  }

  protected validateInput(input: any): void {
    const schema = this.parameters;
    
    // 检查必需字段
    if (schema.required) {
      for (const field of schema.required) {
        if (input[field] === undefined) {
          throw new ToolValidationError(`Missing required field: ${field}`, field);
        }
      }
    }
    
    // 检查字段类型（简化版本）
    for (const [field, propSchema] of Object.entries(schema.properties)) {
      if (input[field] !== undefined) {
        const value = input[field];
        const expectedType = propSchema.type;
        
        if (expectedType === 'string' && typeof value !== 'string') {
          throw new ToolValidationError(`Field ${field} must be a string`, field);
        }
        
        if (expectedType === 'number' && typeof value !== 'number') {
          throw new ToolValidationError(`Field ${field} must be a number`, field);
        }
        
        if (expectedType === 'boolean' && typeof value !== 'boolean') {
          throw new ToolValidationError(`Field ${field} must be a boolean`, field);
        }
      }
    }
  }

  protected abstract performExecution(input: any): Promise<any>;

  getPerformanceStats() {
    const totalExecutions = this.executionCount;
    const errorRate = totalExecutions > 0 ? (this.errorCount / totalExecutions) * 100 : 0;
    const successRate = 100 - errorRate;
    
    return {
      totalExecutions,
      errorCount: this.errorCount,
      errorRate,
      successRate,
      executionHistory: this.executionHistory.slice(-10) // 最近10次执行
    };
  }

  resetStats(): void {
    this.executionCount = 0;
    this.errorCount = 0;
    this.executionHistory = [];
  }
}
