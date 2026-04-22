import { Tool, ToolInput, ToolExecutionMetrics, ToolOutput } from './types/Tool';
import { GrpcClient } from '../protocols/grpc/GrpcClient';

export interface EnhancedMCPInput extends ToolInput {
  serverUrl?: string;
}

export class EnhancedMCPTool implements Tool {
  name = 'enhanced_mcp';
  description = '通过增强MCP协议执行远程工具调用';
  parameters = {
    type: 'object',
    properties: {
      serverUrl: { type: 'string', description: '目标服务器地址' },
      toolName: { type: 'string', description: '要调用的工具名' },
      input: { type: 'object', description: '工具输入参数' }
    },
    required: ['toolName']
  };

  private client: GrpcClient;
  private executionCount: number = 0;
  private errorCount: number = 0;
  private executionHistory: ToolExecutionMetrics[] = [];

  constructor() {
    this.client = new GrpcClient('localhost:50051');
  }

  async performExecution(input: any): Promise<ToolOutput> {
    const startTime = Date.now();
    this.executionCount++;

    try {
      const { toolName, input: toolInput, serverUrl } = input;
      
      if (serverUrl) {
        this.client = new GrpcClient(serverUrl);
      }

      // 模拟gRPC调用
      console.log(`🔧 执行工具: ${toolName}`);
      const result = await this.client.executeTool(toolName, toolInput || {});
      
      const duration = Date.now() - startTime;
      this.executionHistory.push({
        toolName,
        success: true,
        duration,
        timestamp: new Date().toISOString()
      });

      return { result };
    } catch (error: any) {
      this.errorCount++;
      const duration = Date.now() - startTime;
      this.executionHistory.push({
        toolName: input.toolName,
        success: false,
        duration,
        timestamp: new Date().toISOString(),
        error: error.message
      });
      throw error;
    }
  }

  getPerformanceStats(): {
    totalExecutions: number;
    errorCount: number;
    errorRate: number;
    successRate: number;
    executionHistory: ToolExecutionMetrics[];
  } {
    const successRate = this.executionCount > 0 
      ? ((this.executionCount - this.errorCount) / this.executionCount) * 100 
      : 0;
    const errorRate = this.executionCount > 0
      ? (this.errorCount / this.executionCount) * 100
      : 0;
    
    return {
      totalExecutions: this.executionCount,
      errorCount: this.errorCount,
      errorRate,
      successRate,
      executionHistory: this.executionHistory
    };
  }
}
