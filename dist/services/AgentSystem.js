"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSystem = void 0;
const ToolRegistry_1 = require("./ToolRegistry");
const EventBus_1 = require("../core/EventBus");
const ContextManager_1 = require("./ContextManager");
const OpenAIAgent_1 = require("./OpenAIAgent");
const FileTools_1 = require("../tools/FileTools");
class AgentSystem {
    constructor() {
        this.agents = new Map();
        this.eventBus = new EventBus_1.EventBus();
        this.context = new ContextManager_1.ContextManager();
        this.toolRegistry = new ToolRegistry_1.ToolRegistry();
        this.registerDefaultTools();
    }
    registerDefaultTools() {
        this.toolRegistry.register(FileTools_1.FileWriteTool.definition, FileTools_1.FileWriteTool.execute);
        this.toolRegistry.register(FileTools_1.FileReadTool.definition, FileTools_1.FileReadTool.execute);
    }
    async createAgent(config) {
        let agent;
        if (config.capabilities?.includes('openai') || !config.capabilities) {
            agent = new OpenAIAgent_1.OpenAIAgent(config, this.toolRegistry, this.eventBus, this.context);
        }
        else {
            throw new Error('Unknown agent type');
        }
        this.agents.set(agent.id, agent);
        this.eventBus.emit({ type: 'agent.created', payload: { agentId: agent.id, name: agent.name } });
        return agent.getDefinition();
    }
    getAgent(id) {
        return this.agents.get(id)?.getDefinition();
    }
    listAgents() {
        return Array.from(this.agents.values()).map(a => a.getDefinition());
    }
    async processMessage(agentId, message, sessionId) {
        const agent = this.agents.get(agentId);
        if (!agent)
            throw new Error(`Agent ${agentId} not found`);
        const sid = sessionId || `session-${agentId}-${Date.now()}`;
        const result = await agent.processMessage(message, sid);
        return { message: result, sessionId: sid };
    }
    getEventBus() {
        return this.eventBus;
    }
    getContextManager() {
        return this.context;
    }
}
exports.AgentSystem = AgentSystem;
//# sourceMappingURL=AgentSystem.js.map