import { WebSocketBus } from "./protocols/WebSocketBus";
import { EnhancedMCPTool } from "./tools/EnhancedMCPTool";

export * from "./core/Tool";
export * from "./protocols/WebSocketBus";
export * from "./tools/EnhancedMCPTool";

export class HylrichCore {
  private tools: Map<string, EnhancedMCPTool> = new Map();
  private wsBus: WebSocketBus | null = null;
  
  constructor() {
    console.log("🚀 Hylrich AI Agent管理系统初始化");
  }
  
  public registerTool(tool: EnhancedMCPTool): void {
    this.tools.set(tool.name, tool);
    console.log(`✅ 注册工具: ${tool.name}`);
  }
  
  public async connectWebSocket(config: {
    url: string;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
  }): Promise<void> {
    this.wsBus = new WebSocketBus(config);
    await this.wsBus.connect();
    console.log("✅ WebSocket连接已建立");
  }
  
  public async executeTool(toolName: string, input: any): Promise<any> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`工具未找到: ${toolName}`);
    }
    
    console.log(`🛠️ 执行工具: ${toolName}`);
    const result = await tool.execute(input);
    
    // 发送执行结果到WebSocket
    if (this.wsBus) {
      this.wsBus.send({
        type: "tool_execution_result",
        tool: toolName,
        result: result,
        timestamp: Date.now()
      });
    }
    
    return result;
  }
  
  public getToolStats(toolName: string) {
    const tool = this.tools.get(toolName);
    return tool ? tool.getPerformanceReport() : null;
  }
  
  public shutdown(): void {
    if (this.wsBus) {
      this.wsBus.disconnect();
    }
    console.log("🛑 Hylrich系统已关闭");
  }
}
import { AgentScheduler } from "./services/AgentScheduler";

export * from "./services/AgentScheduler";

export class HylrichCore {
  private tools: Map<string, EnhancedMCPTool> = new Map();
  private wsBus: WebSocketBus | null = null;
  private scheduler: AgentScheduler = new AgentScheduler();
  
  constructor() {
    console.log("🚀 Hylrich AI Agent管理系统初始化");
  }
  
  public registerTool(tool: EnhancedMCPTool): void {
    this.tools.set(tool.name, tool);
    
    // 自动注册到调度器
    this.scheduler.registerAgent({
      name: tool.name,
      tool: tool
    });
    
    console.log(`✅ 注册工具: ${tool.name}`);
  }
  
  public async scheduleTask(agentName: string, input: any, priority = 0): Promise<any> {
    return this.scheduler.scheduleTask(agentName, input, priority);
  }
  
  public getAgentStats(agentName: string) {
    return this.scheduler.getAgentStats(agentName);
  }
  
  public getQueueStats() {
    return this.scheduler.getQueueStats();
  }
  
  // 原有其他方法保持不变...
}
