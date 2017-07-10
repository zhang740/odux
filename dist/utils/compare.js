"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function compare(preObj, nxtObj, before) {
    if (nxtObj instanceof Object || nxtObj instanceof Array) {
        for (let key in nxtObj) {
            if (nxtObj.hasOwnProperty(key)) {
                let iseq = !!preObj && !!nxtObj && preObj[key] === nxtObj[key];
                if (preObj[key] instanceof Function && nxtObj[key] instanceof Function) {
                    iseq = false;
                }
                let str = before + '.' + key;
                if (iseq) {
                }
                else {
                    console.info(str, iseq);
                }
            }
            if (preObj instanceof Object || preObj instanceof Array) {
                compare(preObj[key], nxtObj[key], before + '.' + key);
            }
        }
    }
}
exports.compare = compare;
//# sourceMappingURL=compare.js.map