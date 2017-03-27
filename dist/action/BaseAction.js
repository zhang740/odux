"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseAction {
    constructor() {
        this.storeManager = [];
    }
    addStore(store) {
        store && this.storeManager.push(store);
    }
    trackingBegin(stores) {
        (stores || this.storeManager).forEach((store) => {
            store.Adapter && store.Adapter.transactionBegin();
        });
    }
    tracking(func, stores, onErr) {
        (stores || this.storeManager).forEach((store) => {
            store && store.Adapter && store.Adapter.transactionBegin();
        });
        try {
            func();
        }
        catch (error) {
            onErr && onErr(error);
        }
        (stores || this.storeManager).forEach((store) => {
            store && store.Adapter && store.Adapter.transactionEnd();
        });
    }
    trackingEnd(stores) {
        (stores || this.storeManager).forEach((store) => {
            store && store.Adapter && store.Adapter.transactionEnd();
        });
    }
}
exports.BaseAction = BaseAction;
//# sourceMappingURL=BaseAction.js.map