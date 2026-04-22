import OpenAI from 'openai';
declare class OpenAIService {
    private client;
    constructor();
    chat(messages: Array<{
        role: string;
        content: string;
    }>, model?: string): Promise<OpenAI.Chat.Completions.ChatCompletion & {
        _request_id?: string | null;
    } & import("openai/core/streaming").Stream<OpenAI.Chat.Completions.ChatCompletionChunk>>;
    streamChat(messages: Array<{
        role: string;
        content: string;
    }>, model?: string): Promise<OpenAI.Chat.Completions.ChatCompletion & {
        _request_id?: string | null;
    } & import("openai/core/streaming").Stream<OpenAI.Chat.Completions.ChatCompletionChunk>>;
}
export declare const openai: OpenAIService;
export {};
