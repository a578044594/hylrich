"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openai = void 0;
const openai_1 = __importDefault(require("openai"));
class OpenAIService {
    constructor() {
        this.client = null;
        const apiKey = process.env.OPENAI_API_KEY;
        const baseURL = process.env.OPENAI_BASE_URL;
        if (apiKey) {
            this.client = new openai_1.default({
                apiKey,
                baseURL: baseURL || undefined
            });
        }
    }
    async chat(messages, model) {
        if (!this.client)
            throw new Error('OpenAI client not initialized (missing OPENAI_API_KEY)');
        const response = await this.client.chat.completions.create({
            model: model || process.env.LLM_MODEL || 'gpt-4o',
            messages
        });
        return response;
    }
    async streamChat(messages, model) {
        if (!this.client)
            throw new Error('OpenAI client not initialized');
        return this.client.chat.completions.create({
            model: model || process.env.LLM_MODEL || 'gpt-4o',
            messages,
            stream: true
        });
    }
}
exports.openai = new OpenAIService();
//# sourceMappingURL=OpenAIService.js.map