"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var dyna_loops_1 = require("dyna-loops");
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
                        * (dyna_loops_1.random(_this._config.increasePercentFrom, _this._config.increasePercentTo) / 100));
                if (output > _this._config.retryTimeoutMaxMs)
                    output = _this._config.retryTimeoutMaxMs;
                return output;
            },
            onCancel: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, undefined];
            }); }); },
            onRetry: function () { return undefined; },
            onFail: function () { return undefined; },
        };
        this._retryNo = 0;
        this._currentDelay = 0;
        this._canceled = false;
        this._canceledErrorMessage = '';
        this._isWorking = false;
        this._bufferedStarts = [];
        this._config = __assign(__assign({}, this._config), config);
    }
    DynaRetry.prototype._getDelay = function () {
        return this._currentDelay = this._config.delayAlgorithm(this._currentDelay, this._retryNo);
    };
    DynaRetry.prototype.start = function () {
        var _this = this;
        if (this._isWorking)
            return new Promise(function (resolve, reject) { return _this._bufferedStarts.push({ resolve: resolve, reject: reject }); });
        this._isWorking = true;
        this._canceled = false;
        this._canceledErrorMessage = '';
        var cancel = false;
        var cancelIt = function (cancelErrorMessage) {
            _this._canceledErrorMessage = cancelErrorMessage || 'Canceled';
            cancel = true;
        };
        var lastError = null;
        return new Promise(function (resolve, reject) {
            var tryIt = function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(this._canceled || cancel)) return [3 /*break*/, 2];
                            return [4 /*yield*/, this._config.onCancel()];
                        case 1:
                            _a.sent();
                            reject({
                                message: this._canceledErrorMessage,
                                data: { lastError: lastError }
                            });
                            return [2 /*return*/];
                        case 2:
                            this._retryNo++;
                            this._config.onRetry && this._config.onRetry(this._retryNo, cancelIt);
                            this._config.operation()
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
                            return [2 /*return*/];
                    }
                });
            }); };
            tryIt();
        });
    };
    DynaRetry.prototype.cancel = function (errorMessage) {
        if (!this._isWorking)
            return;
        this._canceled = true;
        this._canceledErrorMessage = errorMessage || 'Canceled';
    };
    return DynaRetry;
}());
exports.DynaRetry = DynaRetry;
//# sourceMappingURL=DynaRetry.js.map