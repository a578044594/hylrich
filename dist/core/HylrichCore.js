"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HylrichCore = void 0;
const AgentSystem_1 = require("../services/AgentSystem");
class HylrichCore {
    constructor() {
        this.agentSystem = new AgentSystem_1.AgentSystem();
    }
    getStatus() {
        const agents = this.agentSystem.listAgents();
        return {
            status: 'active',
            agentsCount: agents.length,
            agents: agents,
            uptime: process.uptime()
        };
    }
    async createAgent(config) {
        return this.agentSystem.createAgent(config);
    }
    async executeTool(toolName, input) {
        return this.agentSystem.executeTool(toolName, input);
    }
    async chat(agentId, message, sessionId) {
        return this.agentSystem.chat(agentId, message, sessionId);
    }
    getEventBus() {
        return this.agentSystem.getEventBus();
    }
    getContextManager() {
        return this.agentSystem.getContextManager();
    }
    listAgents() {
        return this.agentSystem.listAgents();
    }
    getAgent(id) {
        return this.agentSystem.getAgent(id);
    }
}
exports.HylrichCore = HylrichCore;
//# sourceMappingURL=HylrichCore.js.map