import { ToolDefinition, ToolResult, ToolExecutionContext } from '../types/tool';

export class ToolNotFoundError extends Error {
  constructor(public toolName: string) {
    super(`Tool '${toolName}' not found`);
  }
}

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();
  private executors: Map<string, (input: any, context: ToolExecutionContext) => Promise<ToolResult>> = new Map();

  register(def: ToolDefinition, executor: (input: any, context: ToolExecutionContext) => Promise<ToolResult>) {
    this.tools.set(def.name, def);
    this.executors.set(def.name, executor);
  }

  getDefinition(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  list(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  async execute(name: string, input: any, context?: ToolExecutionContext): Promise<ToolResult> {
    const executor = this.executors.get(name);
    if (!executor) {
      throw new ToolNotFoundError(name);
    }
    return executor(input, context || {});
  }
}
