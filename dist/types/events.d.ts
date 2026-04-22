export interface Event {
    type: string;
    timestamp: number;
    agentId?: string;
    sessionId?: string;
    payload: any;
}
export interface EventBus {
    emit(event: Event): void;
    on(filter: {
        type?: string;
        agentId?: string;
    }, handler: (event: Event) => void): void;
}
