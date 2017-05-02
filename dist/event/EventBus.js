"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("power-di/utils");
class EventBus {
    constructor() {
        this.eventHandlers = {};
    }
    addEventListener(eventType, callback) {
        const type = utils_1.getGlobalType(eventType);
        if (!type) {
            throw new Error(`No EventType Found. ${type}`);
        }
        if (!this.eventHandlers[type]) {
            this.eventHandlers[type] = [];
        }
        this.eventHandlers[type].push(callback);
    }
    removeEventListener(eventType, callback) {
        const type = utils_1.getGlobalType(eventType);
        if (!type) {
            throw new Error(`No EventType Found. ${type}`);
        }
        for (const key in this.eventHandlers) {
            if (type && key !== type)
                continue;
            if (this.eventHandlers.hasOwnProperty(key)) {
                const element = this.eventHandlers[key];
                const index = element.indexOf(callback);
                if (index !== -1) {
                    element.splice(index, 1);
                }
            }
        }
    }
    emit(event) {
        const type = utils_1.getGlobalType(event.constructor);
        if (!type) {
            throw new Error(`No EventType Found. ${type}`);
        }
        this.eventHandlers[type] &&
            this.eventHandlers[type].forEach((handler) => {
                handler(event);
            });
    }
}
exports.EventBus = EventBus;
//# sourceMappingURL=EventBus.js.map