"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Odux_1 = require("../core/Odux");
const BaseAction_1 = require("../action/BaseAction");
function createOdux(config) {
    const odux = new Odux_1.Odux(undefined, config);
    BaseAction_1.BaseAction.GlobalAdapters.push(odux);
    return odux;
}
exports.createOdux = createOdux;
const redux_1 = require("redux");
function createOduxAIO(config, middlewares = []) {
    const finalCreateStore = redux_1.compose(redux_1.applyMiddleware(...middlewares), this.window && this.window.devToolsExtension && config.isDebug ?
        window.devToolsExtension() : (f) => f)(redux_1.createStore);
    const odux = createOdux(config);
    odux.setRootStore(finalCreateStore(odux.mainReducer.bind(odux)));
    return odux;
}
exports.createOduxAIO = createOduxAIO;
//# sourceMappingURL=createOdux.js.map