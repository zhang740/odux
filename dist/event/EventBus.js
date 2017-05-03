"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("power-di/utils");
class EventBus {
    constructor() {
        this.eventHandlers = {};
    }
    addEventListener(eventType, callback) {
        const type = this.getEventType(eventType);
        if (!this.eventHandlers[type]) {
            this.eventHandlers[type] = [];
        }
        this.eventHandlers[type].push(callback);
    }
    removeEventListener(eventType, callback) {
        const type = this.getEventType(eventType);
        const element = this.eventHandlers[type];
        if (element) {
            const index = element.indexOf(callback);
            if (index !== -1) {
                element.splice(index, 1);
            }
        }
    }
    emit(event) {
        const type = this.getEventType(event.constructor);
        this.eventHandlers[type] &&
            this.eventHandlers[type].forEach((handler) => {
                handler(event);
            });
    }
    getEventType(evt) {
        try {
            return utils_1.getGlobalType(evt);
        }
        catch (error) {
            throw new Error(`EventType NotFound. ${error}`);
        }
    }
}
exports.EventBus = EventBus;
//# sourceMappingURL=EventBus.js.map