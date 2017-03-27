"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ProxyObject {
    constructor(spy, value, key, parentPath, fullPath) {
        this.spy = spy;
        this.value = value;
        this.key = key;
        this.parentPath = parentPath;
        this.fullPath = fullPath;
        this.spy.spyReport({
            type: 'Create',
            key,
            parentPath,
            fullPath,
            newValue: value,
        });
    }
    get() {
        this.spy.spyReport({
            type: 'Read',
            key: this.key,
            parentPath: this.parentPath,
            fullPath: this.fullPath,
            newValue: this.value,
        });
        return this.value;
    }
    set(newValue) {
        const oldValue = this.value;
        this.value = newValue;
        this.spy.spyReport({
            type: 'Update',
            key: this.key,
            parentPath: this.parentPath,
            fullPath: this.fullPath,
            newValue: newValue,
            oldValue: oldValue
        });
    }
}
exports.ProxyObject = ProxyObject;
//# sourceMappingURL=ProxyObject.js.map