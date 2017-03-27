"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Spy {
    constructor() {
        this.spyListeners = [];
    }
    isSpyEnabled() {
        return !!this.spyListeners.length;
    }
    spyReport(event) {
        if (!this.spyListeners.length)
            return false;
        const listeners = this.spyListeners;
        for (let i = 0, l = listeners.length; i < l; i++)
            listeners[i](event);
    }
    addListener(listener) {
        this.spyListeners.push(listener);
    }
    removeListener(listener) {
        const idx = this.spyListeners.indexOf(listener);
        if (idx >= 0) {
            this.spyListeners.splice(idx, 1);
        }
    }
}
exports.Spy = Spy;
//# sourceMappingURL=Spy.js.map