import { BaseEvent } from './BaseEvent';
export declare class EventBus {
    private eventHandlers;
    addEventListener<T>(eventType: any, callback: <T extends BaseEvent>(event: T) => void): void;
    removeEventListener<T>(eventType: any, callback: <T extends BaseEvent>(event: T) => void): void;
    emit(event: BaseEvent): void;
    private getEventType(evt);
}
