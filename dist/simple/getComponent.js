"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const power_di_1 = require("power-di");
function getComponent(type) {
    return power_di_1.IocContext.DefaultInstance.get(type);
}
exports.getComponent = getComponent;
//# sourceMappingURL=getComponent.js.map