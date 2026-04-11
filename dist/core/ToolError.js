"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolValidationError = exports.ToolExecutionError = exports.ToolError = void 0;
class ToolError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'ToolError';
    }
}
exports.ToolError = ToolError;
class ToolExecutionError extends ToolError {
    constructor(message, toolName) {
        super(message);
        this.toolName = toolName;
        this.name = 'ToolExecutionError';
    }
}
exports.ToolExecutionError = ToolExecutionError;
class ToolValidationError extends ToolError {
    constructor(message, field) {
        super(message);
        this.field = field;
        this.name = 'ToolValidationError';
    }
}
exports.ToolValidationError = ToolValidationError;
//# sourceMappingURL=ToolError.js.map