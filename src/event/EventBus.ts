import { BaseEvent } from './BaseEvent';
import { getGlobalType } from 'power-di/utils';

export class EventBus {

    private eventHandlers: { [key: string]: ((event: BaseEvent) => void)[] } = {};

    public addEventListener<T>(eventType: typeof BaseEvent, callback: <T extends BaseEvent>(event: T) => void) {
        const type = getGlobalType(eventType);
        if (!type) {
            throw new Error(`No EventType Found. ${type}`);
        }
        if (!this.eventHandlers[type]) {
            this.eventHandlers[type] = [];
        }
        this.eventHandlers[type].push(callback);
    }

    public removeEventListener<T>(eventType: typeof BaseEvent, callback: <T extends BaseEvent>(event: T) => void) {
        const type = getGlobalType(eventType);
        if (!type) {
            throw new Error(`No EventType Found. ${type}`);
        }
        for (const key in this.eventHandlers) {
            if (type && key !== type) continue;
            if (this.eventHandlers.hasOwnProperty(key)) {
                const element = this.eventHandlers[key];
                const index = element.indexOf(callback);
                if (index !== -1) {
                    element.splice(index, 1);
                }
            }
        }
    }

    public emit(event: BaseEvent) {
        const type = getGlobalType(event.constructor);
        if (!type) {
            throw new Error(`No EventType Found. ${type}`);
        }
        this.eventHandlers[type] &&
            this.eventHandlers[type].forEach((handler) => {
                handler(event);
            });
    }
}