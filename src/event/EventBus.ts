import { BaseEvent } from './BaseEvent';
import { guard } from '../utils/guard';
import { getGlobalType } from 'power-di/utils';

export class EventBus {

    private eventHandlers: { [key: string]: ((event: BaseEvent) => void)[] } = {};

    public addEventListener<T>(eventType: typeof BaseEvent, callback: <T extends BaseEvent>(event: T) => void) {
        const type = this.getEventType(eventType);
        if (!this.eventHandlers[type]) {
            this.eventHandlers[type] = [];
        }
        this.eventHandlers[type].push(callback);
    }

    public removeEventListener<T>(eventType: typeof BaseEvent, callback: <T extends BaseEvent>(event: T) => void) {
        const type = this.getEventType(eventType);
        const element = this.eventHandlers[type];
        if (element) {
            const index = element.indexOf(callback);
            if (index !== -1) {
                element.splice(index, 1);
            }
        }
    }

    public emit(event: BaseEvent) {
        const type = this.getEventType(event.constructor);
        this.eventHandlers[type] &&
            this.eventHandlers[type].forEach((handler) => {
                handler(event);
            });
    }

    private getEventType(evt: any) {
        try {
            return getGlobalType(evt);
        } catch (error) {
            throw new Error(`EventType NotFound. ${error}`);
        }
    }
}