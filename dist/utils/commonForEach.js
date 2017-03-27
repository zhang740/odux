"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function commonForEach(data, func) {
    let target = [];
    const isArray = data instanceof Array;
    if (isArray) {
        target = data;
    }
    else if (data instanceof Object) {
        target = Object.keys(data);
    }
    for (let index = 0; index < target.length; index++) {
        if (isArray) {
            func(index + '');
        }
        else {
            func(target[index]);
        }
    }
}
exports.commonForEach = commonForEach;
//# sourceMappingURL=commonForEach.js.map