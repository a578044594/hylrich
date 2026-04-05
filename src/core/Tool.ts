export abstract class Tool {
  abstract name: string;
  abstract description: string;
  abstract parameters: any;
  abstract execute(input: any): Promise<any>;
  
  // 性能监控
  private executionCount = 0;
  private totalExecutionTime = 0;
  
  protected recordExecution(startTime: number, endTime: number): void {
    this.executionCount++;
    this.totalExecutionTime += (endTime - startTime);
  }
  
  public getPerformanceStats() {
    return {
      executionCount: this.executionCount,
      averageExecutionTime: this.executionCount > 0 
        ? this.totalExecutionTime / this.executionCount 
        : 0
    };
  }
}
