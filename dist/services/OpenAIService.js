"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIService = void 0;
const openai_1 = __importDefault(require("openai"));
class OpenAIService {
    constructor(apiKey, model, baseUrl) {
        const config = {
            apiKey: apiKey || process.env.OPENAI_API_KEY,
        };
        if (baseUrl || process.env.OPENAI_BASE_URL) {
            config.baseURL = baseUrl || process.env.OPENAI_BASE_URL;
        }
        this.client = new openai_1.default(config);
        this.model = model || process.env.LLM_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    }
    async chat(message, systemPrompt) {
        try {
            const messages = [];
            if (systemPrompt) {
                messages.push({ role: 'system', content: systemPrompt });
            }
            messages.push({ role: 'user', content: message });
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages,
                temperature: 0.7,
                max_tokens: 2000,
            });
            return response.choices[0]?.message?.content || 'No response';
        }
        catch (error) {
            console.error('OpenAI API error:', error);
            throw new Error(`OpenAI error: ${error.message}`);
        }
    }
}
exports.OpenAIService = OpenAIService;
//# sourceMappingURL=OpenAIService.js.map