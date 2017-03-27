"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function compare(preObj, nxtObj, before) {
    if (nxtObj instanceof Object || nxtObj instanceof Array) {
        for (let key in nxtObj) {
            try {
                if (nxtObj.hasOwnProperty(key)) {
                    let iseq = !!preObj && !!nxtObj && preObj[key] === nxtObj[key];
                    if (preObj[key] instanceof Function && nxtObj[key] instanceof Function) {
                        iseq = undefined;
                    }
                    let str = before + '.' + key;
                    if (iseq) {
                    }
                    else {
                        this.console.info(str, iseq);
                    }
                }
                if (preObj instanceof Object || preObj instanceof Array) {
                    this.compare(preObj[key], nxtObj[key], before + '.' + key);
                }
            }
            catch (error) {
                this.console.info(before + '.' + key, 'err');
            }
        }
    }
}
exports.compare = compare;
//# sourceMappingURL=compare.js.map