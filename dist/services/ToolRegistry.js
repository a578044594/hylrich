"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolRegistry = exports.ToolNotFoundError = void 0;
class ToolNotFoundError extends Error {
    constructor(toolName) {
        super(`Tool '${toolName}' not found`);
        this.toolName = toolName;
    }
}
exports.ToolNotFoundError = ToolNotFoundError;
class ToolRegistry {
    constructor() {
        this.tools = new Map();
        this.executors = new Map();
    }
    register(def, executor) {
        this.tools.set(def.name, def);
        this.executors.set(def.name, executor);
    }
    getDefinition(name) {
        return this.tools.get(name);
    }
    list() {
        return Array.from(this.tools.values());
    }
    async execute(name, input, context) {
        const executor = this.executors.get(name);
        if (!executor) {
            throw new ToolNotFoundError(name);
        }
        return executor(input, context || {});
    }
}
exports.ToolRegistry = ToolRegistry;
//# sourceMappingURL=ToolRegistry.js.map