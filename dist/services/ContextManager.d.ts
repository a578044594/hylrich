import { Message } from '../types/message';
export declare class ContextManager {
    private sessions;
    getMessages(sessionId: string): Message[];
    addMessage(sessionId: string, message: Message): void;
    clearSession(sessionId: string): void;
    save(): Promise<void>;
    load(): Promise<void>;
}
