"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseAction {
    static get GlobalAdapters() { return this.globalAdapters; }
    trackingBegin(stores) {
        ((stores && stores.map(s => s.Adapter)) || BaseAction.GlobalAdapters).forEach((adapter) => {
            adapter && adapter.transactionBegin();
        });
    }
    tracking(func, stores, onErr) {
        this.trackingBegin(stores);
        try {
            func();
        }
        catch (error) {
            onErr && onErr(error);
        }
        this.trackingEnd(stores);
    }
    trackingEnd(stores) {
        ((stores && stores.map(s => s.Adapter)) || BaseAction.GlobalAdapters).forEach((adapter) => {
            adapter && adapter.transactionEnd();
        });
    }
}
BaseAction.globalAdapters = [];
exports.BaseAction = BaseAction;
//# sourceMappingURL=BaseAction.js.map