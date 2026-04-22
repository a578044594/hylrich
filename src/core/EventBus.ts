import { Event } from '../types/events';

type Handler = (event: Event) => void;

export class EventBus {
  private handlers: Map<string, Set<Handler>> = new Map();

  emit(event: Event) {
    const type = event.type;
    const all = this.handlers.get('*') || new Set();
    const specific = this.handlers.get(type) || new Set();
    all.forEach(h => this.safeCall(h, event));
    specific.forEach(h => this.safeCall(h, event));
  }

  on(type: string, handler: Handler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    return () => this.off(type, handler);
  }

  off(type: string, handler: Handler) {
    this.handlers.get(type)?.delete(handler);
  }

  private safeCall(handler: Handler, event: Event) {
    try {
      handler(event);
    } catch (err) {
      console.error('Event handler error:', err);
    }
  }
}
