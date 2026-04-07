"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentScheduler = void 0;
class AgentScheduler {
    constructor() {
        this.agents = new Map();
        this.taskQueue = [];
        this.runningTasks = new Map();
        this.completedTasks = [];
        this.maxCompletedHistory = 1000;
    }
    registerAgent(config) {
        this.agents.set(config.name, {
            maxConcurrent: 1,
            timeout: 30000,
            memoryLimit: 1024 * 1024 * 100, // 100MB
            ...config
        });
        console.log(`✅ 注册Agent: ${config.name}`);
    }
    async scheduleTask(agentName, input, priority = 0) {
        const agent = this.agents.get(agentName);
        if (!agent) {
            throw new Error(`Agent未注册: ${agentName}`);
        }
        const task = {
            id: this.generateTaskId(),
            agentName,
            input,
            priority,
            createdAt: Date.now(),
            status: "pending"
        };
        this.taskQueue.push(task);
        this.sortTaskQueue();
        // 立即尝试执行任务
        this.processQueue();
        return this.waitForTaskCompletion(task.id);
    }
    async processQueue() {
        for (const agentName of this.agents.keys()) {
            const agent = this.agents.get(agentName);
            const runningCount = Array.from(this.runningTasks.values())
                .filter(task => task.agentName === agentName && task.status === "running")
                .length;
            if (runningCount < (agent.maxConcurrent || 1)) {
                const nextTask = this.findNextTask(agentName);
                if (nextTask) {
                    await this.executeTask(nextTask);
                }
            }
        }
    }
    async executeTask(task) {
        const agent = this.agents.get(task.agentName);
        task.status = "running";
        task.startTime = Date.now();
        this.runningTasks.set(task.id, task);
        try {
            // 执行实际任务
            const result = await Promise.race([
                agent.tool.execute(task.input),
                new Promise((_, reject) => setTimeout(() => reject(new Error("任务执行超时")), agent.timeout))
            ]);
            task.status = "completed";
            task.result = result;
            task.endTime = Date.now();
        }
        catch (error) {
            task.status = "failed";
            task.error = error;
            task.endTime = Date.now();
        }
        finally {
            this.runningTasks.delete(task.id);
            this.completedTasks.unshift(task);
            // 限制历史记录大小
            if (this.completedTasks.length > this.maxCompletedHistory) {
                this.completedTasks.pop();
            }
            // 继续处理队列
            this.processQueue();
        }
    }
    findNextTask(agentName) {
        return this.taskQueue.find(task => task.agentName === agentName &&
            task.status === "pending") || null;
    }
    sortTaskQueue() {
        this.taskQueue.sort((a, b) => {
            // 优先级高的在前
            if (a.priority !== b.priority) {
                return b.priority - a.priority;
            }
            // 创建时间早的在前
            return a.createdAt - b.createdAt;
        });
    }
    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    waitForTaskCompletion(taskId) {
        return new Promise((resolve, reject) => {
            const checkCompletion = () => {
                const task = this.completedTasks.find(t => t.id === taskId) ||
                    this.runningTasks.get(taskId);
                if (!task) {
                    setTimeout(checkCompletion, 100);
                    return;
                }
                if (task.status === "completed") {
                    resolve(task.result);
                }
                else if (task.status === "failed") {
                    reject(task.error);
                }
                else {
                    setTimeout(checkCompletion, 100);
                }
            };
            checkCompletion();
        });
    }
    getAgentStats(agentName) {
        const tasks = this.completedTasks.filter(task => task.agentName === agentName);
        const successful = tasks.filter(task => task.status === "completed").length;
        const failed = tasks.filter(task => task.status === "failed").length;
        return {
            totalTasks: tasks.length,
            successful,
            failed,
            successRate: tasks.length > 0 ? (successful / tasks.length) * 100 : 0,
            recentTasks: tasks.slice(0, 10)
        };
    }
    getQueueStats() {
        return {
            pending: this.taskQueue.filter(task => task.status === "pending").length,
            running: this.runningTasks.size,
            completed: this.completedTasks.length,
            agents: Array.from(this.agents.keys())
        };
    }
}
exports.AgentScheduler = AgentScheduler;
//# sourceMappingURL=AgentScheduler.js.map