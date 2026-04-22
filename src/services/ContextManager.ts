import { Message } from '../types/message';

export class ContextManager {
  private sessions: Map<string, Message[]> = new Map();

  getMessages(sessionId: string): Message[] {
    return this.sessions.get(sessionId) || [];
  }

  addMessage(sessionId: string, message: Message) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, []);
    }
    this.sessions.get(sessionId)!.push(message);
  }

  clearSession(sessionId: string) {
    this.sessions.delete(sessionId);
  }

  // Persistence stub
  async save() { /* TODO */ }
  async load() { /* TODO */ }
}
