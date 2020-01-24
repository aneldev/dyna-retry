"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DynaRetry_1 = require("./DynaRetry");
exports.retry = function (config) {
    var retry = new DynaRetry_1.DynaRetry(config);
    var output = retry.start();
    output.cancel = retry.cancel;
    return output;
};
//# sourceMappingURL=retry.js.map