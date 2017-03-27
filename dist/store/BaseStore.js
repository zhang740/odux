"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const power_di_1 = require("power-di");
const utils_1 = require("power-di/utils");
const interface_1 = require("../interface");
function storeRegister(iocContext = power_di_1.IocContext.DefaultInstance) {
    return function (target) {
        const storeAdapter = iocContext.get(interface_1.IStoreAdapter);
        iocContext.register(new target(storeAdapter), target);
    };
}
exports.storeRegister = storeRegister;
exports.bindProperty = (bindKey, inital) => (target, key) => {
    const property = bindKey || key;
    Object.defineProperty(target, key, {
        get: function () {
            let result = this.Data[property];
            if (!result && inital !== undefined) {
                this.Adapter.directWriteChange(() => {
                    result = this.Data[property] = inital;
                });
            }
            return result;
        },
        set: function (value) {
            this.Data[property] = value;
        }
    });
};
class BaseStore {
    constructor(storeAdapter) {
        this.storeAdapter = storeAdapter;
        storeAdapter.registerStore && storeAdapter.registerStore(this);
    }
    get type() {
        return utils_1.getGlobalType(this.constructor);
    }
    static get type() {
        return utils_1.getGlobalType(this);
    }
    get Data() {
        return this.storeAdapter.getStoreData(this.type);
    }
    get Adapter() {
        return this.storeAdapter;
    }
}
exports.BaseStore = BaseStore;
//# sourceMappingURL=BaseStore.js.map