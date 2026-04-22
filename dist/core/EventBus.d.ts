import { Event } from '../types/events';
type Handler = (event: Event) => void;
export declare class EventBus {
    private handlers;
    emit(event: Event): void;
    on(type: string, handler: Handler): () => void;
    off(type: string, handler: Handler): void;
    private safeCall;
}
export {};
