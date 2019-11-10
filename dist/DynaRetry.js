"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var dyna_loops_1 = require("dyna-loops");
var DynaRetry = /** @class */ (function () {
    function DynaRetry(config) {
        this._config = {
            operation: function () { return Promise.resolve(null); },
            maxRetries: 5,
            retryTimeoutBaseMs: 500,
            increasePercentFrom: 20,
            increasePercentTo: 60,
            retryTimeoutMaxMs: 1 * 60 * 1000,
        };
        this._retryNo = 0;
        this._currentDelay = 0;
        this._isWorking = false;
        this._bufferedStarts = [];
        this._config = __assign({}, this._config, config);
    }
    DynaRetry.prototype._getDelay = function () {
        if (this._config.delayAlgorithm) {
            this._currentDelay = this._config.delayAlgorithm(this._currentDelay, this._retryNo);
        }
        else {
            this._currentDelay +=
                (this._currentDelay | this._config.retryTimeoutBaseMs)
                    * (dyna_loops_1.random(this._config.increasePercentFrom, this._config.increasePercentTo) / 100);
        }
        if (this._currentDelay > this._config.retryTimeoutMaxMs)
            this._currentDelay = this._config.retryTimeoutMaxMs;
        return this._currentDelay;
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
                    .then(function (data) {
                    _this._isWorking = false;
                    resolve(data);
                    while (_this._bufferedStarts.length)
                        _this._bufferedStarts.shift().resolve(data);
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
                        while (_this._bufferedStarts.length)
                            _this._bufferedStarts.shift().reject(error);
                    }
                });
            };
            tryIt();
        });
    };
    return DynaRetry;
}());
exports.DynaRetry = DynaRetry;
exports.retry = function (config) {
    var retry = new DynaRetry(config);
    return retry.start();
};
//# sourceMappingURL=DynaRetry.js.map