"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
class BaseAgent {
    // Provide tools as a getter from the tool registry
    get tools() {
        return this.toolRegistry.list();
    }
    constructor(config, toolRegistry, eventBus, context) {
        this.state = 'idle';
        this.id = config.id || `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.name = config.name;
        this.description = config.description;
        this.capabilities = config.capabilities || [];
        this.toolRegistry = toolRegistry;
        this.eventBus = eventBus;
        this.context = context;
        this.systemPrompt = config.systemPrompt;
        this.model = config.model;
    }
    async executeTool(toolName, input) {
        return this.toolRegistry.execute(toolName, input, { agentId: this.id });
    }
    getDefinition() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            capabilities: this.capabilities,
            tools: this.tools,
            state: this.state,
            metadata: this.metadata
        };
    }
    emit(event) {
        this.eventBus.emit(event);
    }
}
exports.BaseAgent = BaseAgent;
//# sourceMappingURL=BaseAgent.js.map