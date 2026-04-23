import OpenAI from 'openai';
declare class OpenAIService {
    private client;
    constructor();
    chat(messages: any[], model?: string): Promise<OpenAI.Chat.Completions.ChatCompletion & {
        _request_id?: string | null;
    }>;
    streamChat(messages: any[], model?: string): Promise<import("openai/core/streaming").Stream<OpenAI.Chat.Completions.ChatCompletionChunk> & {
        _request_id?: string | null;
    }>;
}
export declare const openai: OpenAIService;
export {};
