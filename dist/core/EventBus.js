"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
class EventBus {
    constructor() {
        this.handlers = new Map();
    }
    emit(event) {
        const type = event.type;
        const all = this.handlers.get('*') || new Set();
        const specific = this.handlers.get(type) || new Set();
        all.forEach(h => this.safeCall(h, event));
        specific.forEach(h => this.safeCall(h, event));
    }
    on(type, handler) {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, new Set());
        }
        this.handlers.get(type).add(handler);
        return () => this.off(type, handler);
    }
    off(type, handler) {
        this.handlers.get(type)?.delete(handler);
    }
    safeCall(handler, event) {
        try {
            handler(event);
        }
        catch (err) {
            console.error('Event handler error:', err);
        }
    }
}
exports.EventBus = EventBus;
//# sourceMappingURL=EventBus.js.map