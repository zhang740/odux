"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function shallowCopy(data, copyMeta = true) {
    let newData;
    if (data instanceof Array) {
        newData = [].concat(data);
    }
    else if (data instanceof Object) {
        newData = {};
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const element = data[key];
                newData[key] = element;
            }
        }
    }
    else {
        newData = data;
    }
    return newData;
}
exports.shallowCopy = shallowCopy;
//# sourceMappingURL=shallowCopy.js.map