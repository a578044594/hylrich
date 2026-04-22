"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HylrichCore = void 0;
const OpenAIService_1 = require("../services/OpenAIService");
class HylrichCore {
    constructor() {
        this.tools = new Map();
        this.openai = null;
        if (process.env.OPENAI_API_KEY) {
            this.openai = new OpenAIService_1.OpenAIService();
        }
    }
    registerTool(tool) {
        this.tools.set(tool.name, tool);
    }
    async processMessage(input, context) {
        if (this.openai) {
            try {
                const reply = await this.openai.chat(input, '你是一个有用的AI助手。');
                return { reply, timestamp: new Date().toISOString() };
            }
            catch (error) {
                return {
                    reply: `抱歉，AI服务出错: ${error.message}`,
                    error: error.message,
                    timestamp: new Date().toISOString()
                };
            }
        }
        return {
            reply: `收到消息: "${input}" (未配置 OPENAI_API_KEY)`,
            timestamp: new Date().toISOString()
        };
    }
}
exports.HylrichCore = HylrichCore;
//# sourceMappingURL=HylrichCore.js.map