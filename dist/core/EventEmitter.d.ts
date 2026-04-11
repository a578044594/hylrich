export declare class EventEmitter {
    private listeners;
    on(event: string, listener: Function): void;
    emit(event: string, ...args: any[]): void;
    off(event: string, listener: Function): void;
}
