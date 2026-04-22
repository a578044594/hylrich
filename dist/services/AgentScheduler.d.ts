import { Tool } from '../core/Tool';
export interface AgentConfig {
    name: string;
    tool: Tool;
    maxConcurrent?: number;
    timeout?: number;
    memoryLimit?: number;
}
export interface AgentTask {
    id: string;
    agentName: string;
    input: any;
    priority: number;
    createdAt: number;
    status: "pending" | "running" | "completed" | "failed";
    result?: any;
    error?: any;
    startTime?: number;
    endTime?: number;
}
export declare class AgentScheduler {
    private agents;
    private taskQueue;
    private runningTasks;
    private completedTasks;
    private maxCompletedHistory;
    registerAgent(config: AgentConfig): void;
    scheduleTask(agentName: string, input: any, priority?: number): Promise<any>;
    private processQueue;
    private executeTask;
    private findNextTask;
    private sortTaskQueue;
    private generateTaskId;
    private waitForTaskCompletion;
    getAgentStats(agentName: string): {
        totalTasks: number;
        successful: number;
        failed: number;
        successRate: number;
        recentTasks: AgentTask[];
    };
    getQueueStats(): {
        pending: number;
        running: number;
        completed: number;
        agents: string[];
    };
}
