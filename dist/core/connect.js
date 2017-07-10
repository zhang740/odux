"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_redux_1 = require("react-redux");
function connect(mapper) {
    return react_redux_1.connect((state, props) => mapper(props));
}
exports.connect = connect;
//# sourceMappingURL=connect.js.map