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
//# sourceMappingURL=createOdux.js.map