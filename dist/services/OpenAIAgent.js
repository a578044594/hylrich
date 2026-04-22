"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIAgent = void 0;
const BaseAgent_1 = require("./BaseAgent");
const OpenAIService_1 = require("../services/OpenAIService");
class OpenAIAgent extends BaseAgent_1.BaseAgent {
    async processMessage(message, sessionId) {
        this.state = 'running';
        this.emit({ type: 'agent.started', payload: { sessionId } });
        // Retrieve conversation history
        const history = this.context.getMessages(sessionId);
        // Build messages
        const messages = [
            ...(this.systemPrompt ? [{ role: 'system', content: this.systemPrompt }] : []),
            ...history.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: message }
        ];
        try {
            // Simple chat completion without tool calling for now
            const response = await OpenAIService_1.openai.chat.completions.create({
                model: this.model || 'gpt-4o',
                messages
            });
            const content = response.choices[0].message.content || '';
            // Save to context
            const userMsg = {
                id: `msg-${Date.now()}-user`,
                agentId: this.id,
                role: 'user',
                content: message,
                timestamp: Date.now()
            };
            const assistantMsg = {
                id: `msg-${Date.now()}-assistant`,
                agentId: this.id,
                role: 'assistant',
                content,
                timestamp: Date.now()
            };
            this.context.addMessage(sessionId, userMsg);
            this.context.addMessage(sessionId, assistantMsg);
            this.state = 'idle';
            this.emit({ type: 'agent.completed', payload: { sessionId, messageId: assistantMsg.id } });
            return assistantMsg;
        }
        catch (err) {
            this.state = 'error';
            this.emit({ type: 'agent.error', payload: { sessionId, error: err.message } });
            throw err;
        }
    }
}
exports.OpenAIAgent = OpenAIAgent;
//# sourceMappingURL=OpenAIAgent.js.map