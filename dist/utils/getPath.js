"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getPath(path, key) {
    let readPath = path;
    if (readPath && readPath !== '') {
        readPath += '.';
    }
    readPath += key;
    return readPath;
}
exports.getPath = getPath;
//# sourceMappingURL=getPath.js.map