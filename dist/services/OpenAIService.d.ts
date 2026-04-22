export declare class OpenAIService {
    private client;
    private model;
    constructor(apiKey?: string, model?: string, baseUrl?: string);
    chat(message: string, systemPrompt?: string): Promise<string>;
}
