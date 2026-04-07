export declare abstract class Tool {
    abstract name: string;
    abstract description: string;
    abstract parameters: any;
    abstract execute(input: any): Promise<any>;
    private executionCount;
    private totalExecutionTime;
    protected recordExecution(startTime: number, endTime: number): void;
    getPerformanceStats(): {
        executionCount: number;
        averageExecutionTime: number;
    };
}
