var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { random } from "dyna-loops";
var DynaRetry = /** @class */ (function () {
    function DynaRetry(config) {
        var _this = this;
        this.config = config;
        this._config = {
            maxRetries: 5,
            operation: function () { return new Promise(function (r) { return r(); }); },
            retryTimeoutBaseMs: 500,
            increasePercentFrom: 20,
            increasePercentTo: 60,
            retryTimeoutMaxMs: 60 * 1000 * 1,
            delayAlgorithm: function (currentDelay, retryNo) {
                if (currentDelay === _this._config.retryTimeoutMaxMs)
                    return currentDelay;
                var output = currentDelay +
                    ((currentDelay | _this._config.retryTimeoutBaseMs)
                        * (random(_this._config.increasePercentFrom, _this._config.increasePercentTo) / 100));
                if (output > _this._config.retryTimeoutMaxMs)
                    output = _this._config.retryTimeoutMaxMs;
                return output;
            },
            onRetry: function () { return undefined; },
            onFail: function () { return undefined; },
        };
        this._retryNo = 0;
        this._currentDelay = 0;
        this._isWorking = false;
        this._bufferedStarts = [];
        this._config = __assign(__assign({}, this._config), config);
        console.debug('config', config);
    }
    DynaRetry.prototype._getDelay = function () {
        return this._currentDelay = this._config.delayAlgorithm(this._currentDelay, this._retryNo);
    };
    DynaRetry.prototype.start = function () {
        var _this = this;
        if (this._isWorking)
            return new Promise(function (resolve, reject) { return _this._bufferedStarts.push({ resolve: resolve, reject: reject }); });
        this._isWorking = true;
        var cancel = false;
        var cancelIt = function () { return cancel = true; };
        var lastError = null;
        return new Promise(function (resolve, reject) {
            var tryIt = function () {
                if (cancel) {
                    reject(lastError);
                    return;
                }
                _this._retryNo++;
                _this._config.onRetry && _this._config.onRetry(_this._retryNo, cancelIt);
                _this._config.operation()
                    .then(function (r) {
                    _this._isWorking = false;
                    resolve(r);
                    while (_this._bufferedStarts.length) {
                        var bufferedStart = _this._bufferedStarts.shift();
                        if (bufferedStart)
                            bufferedStart.resolve(r);
                    }
                })
                    .catch(function (error) {
                    lastError = error;
                    _this._config.onFail && _this._config.onFail(error, _this._retryNo, cancelIt);
                    if (_this._config.maxRetries === null || _this._retryNo < _this._config.maxRetries) {
                        setTimeout(tryIt, _this._getDelay());
                    }
                    else {
                        _this._isWorking = false;
                        reject(error);
                        while (_this._bufferedStarts.length) {
                            var bufferedStart = _this._bufferedStarts.shift();
                            if (bufferedStart)
                                bufferedStart.reject(error);
                        }
                    }
                });
            };
            tryIt();
        });
    };
    return DynaRetry;
}());
export { DynaRetry };
export var retry = function (config) {
    var retry = new DynaRetry(config);
    return retry.start();
};
//# sourceMappingURL=DynaRetry.js.map