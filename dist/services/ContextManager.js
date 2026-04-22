"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextManager = void 0;
class ContextManager {
    constructor() {
        this.sessions = new Map();
    }
    getMessages(sessionId) {
        return this.sessions.get(sessionId) || [];
    }
    addMessage(sessionId, message) {
        if (!this.sessions.has(sessionId)) {
            this.sessions.set(sessionId, []);
        }
        this.sessions.get(sessionId).push(message);
    }
    clearSession(sessionId) {
        this.sessions.delete(sessionId);
    }
    // Persistence stub
    async save() { }
    async load() { }
}
exports.ContextManager = ContextManager;
//# sourceMappingURL=ContextManager.js.map