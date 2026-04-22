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
        return this.agentSystem.toolRegistry.execute(toolName, input);
    }
    async chat(agentId, message, sessionId) {
        return this.agentSystem.processMessage(agentId, message, sessionId);
    }
    getEventBus() {
        return this.agentSystem.getEventBus();
    }
    getContextManager() {
        return this.agentSystem.getContextManager();
    }
}
exports.HylrichCore = HylrichCore;
listAgents();
{
    return this.agentSystem.listAgents();
}
getAgent(id, string);
{
    return this.agentSystem.getAgent(id);
}
//# sourceMappingURL=HylrichCore.js.map