"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function guard(func, defaultValue, onError) {
    try {
        return func();
    }
    catch (error) {
        onError && onError(error);
        return defaultValue;
    }
}
exports.guard = guard;
//# sourceMappingURL=guard.js.map