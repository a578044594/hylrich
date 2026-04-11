export class ToolError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'ToolError';
  }
}

export class ToolExecutionError extends ToolError {
  constructor(message: string, public toolName?: string) {
    super(message);
    this.name = 'ToolExecutionError';
  }
}

export class ToolValidationError extends ToolError {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ToolValidationError';
  }
}
