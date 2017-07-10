"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_1 = require("../event");
class ProxyObject {
    constructor(eventBus, config, trackingData, value, key, parentPath, fullPath) {
        this.eventBus = eventBus;
        this.config = config;
        this.trackingData = trackingData;
        this.value = value;
        this.key = key;
        this.parentPath = parentPath;
        this.fullPath = fullPath;
        this.eventBus.emit(new event_1.SpyEvent({
            type: 'Create',
            key,
            parentPath,
            fullPath,
            newValue: value,
        }));
    }
    get() {
        this.eventBus.emit(new event_1.SpyEvent({
            type: 'Read',
            key: this.key,
            parentPath: this.parentPath,
            fullPath: this.fullPath,
            newValue: this.value,
        }));
        return this.value;
    }
    set(newValue) {
        const oldValue = this.value;
        this.value = newValue;
        this.eventBus.emit(new event_1.SpyEvent({
            type: 'Update',
            key: this.key,
            parentPath: this.parentPath,
            fullPath: this.fullPath,
            newValue: newValue,
            oldValue: oldValue
        }));
    }
}
exports.ProxyObject = ProxyObject;
//# sourceMappingURL=ProxyObject.js.map