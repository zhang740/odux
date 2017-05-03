"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function guard(func, defaultValue, onError) {
    try {
        return func();
    }
    catch (error) {
        return (onError && onError(error)) || defaultValue;
    }
}
exports.guard = guard;
//# sourceMappingURL=guard.js.map