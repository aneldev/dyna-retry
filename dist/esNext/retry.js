import { DynaRetry } from "./DynaRetry";
export var retry = function (config) {
    var retry = new DynaRetry(config);
    var output = retry.start();
    output.cancel = retry.cancel;
    return output;
};
//# sourceMappingURL=retry.js.map