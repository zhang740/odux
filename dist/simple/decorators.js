"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const power_di_1 = require("power-di");
const helper_1 = require("power-di/helper");
_a = helper_1.getDecorators(), exports.lazyInject = _a.lazyInject, exports.register = _a.register, exports.registerSubClass = _a.registerSubClass;
const connect_1 = require("../connect");
function registerStore() {
    return exports.register(undefined, { autoNew: false, regInSuperClass: true });
}
exports.registerStore = registerStore;
function connect(mapper) {
    return connect_1.connect(mapper(power_di_1.IocContext.DefaultInstance));
}
exports.connect = connect;
var _a;
//# sourceMappingURL=decorators.js.map