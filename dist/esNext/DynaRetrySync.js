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
import { retry } from "./DynaRetry";
var DynaRetrySync = /** @class */ (function () {
    function DynaRetrySync(config) {
        if (config === void 0) { config = {}; }
        this._items = [];
        this._isWorking = false;
        this._active = false; // object user's start and stop handle
        this._paused = false; // for internal use only... used on onFail callback when we are waiting the object user to react with "retry", "skip" or "stop",
        this._config = __assign({ active: true }, config);
        this._active = this._config.active;
        if (!this._config.onFail) {
            console.error('DynaRetrySync requires to implement the onFail function. See at https://github.com/aneldev/dyna-retry#onfail-item-idynaretryconfig-error-any-retry---void-skip---void-stop---void');
        }
    }
    Object.defineProperty(DynaRetrySync.prototype, "isWorking", {
        get: function () {
            return this.isWorking;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynaRetrySync.prototype, "count", {
        get: function () {
            return this._items.length;
        },
        enumerable: true,
        configurable: true
    });
    DynaRetrySync.prototype.add = function (retryItem) {
        this._items.push(retryItem);
        this.processNext();
    };
    DynaRetrySync.prototype.start = function () {
        this._active = true;
        this.processNext();
    };
    DynaRetrySync.prototype.stop = function () {
        this._active = false;
    };
    Object.defineProperty(DynaRetrySync.prototype, "active", {
        get: function () {
            return this._active;
        },
        enumerable: true,
        configurable: true
    });
    DynaRetrySync.prototype.processNext = function () {
        var _this = this;
        if (!this._active)
            return;
        if (this._paused)
            return;
        if (this._isWorking)
            return;
        if (!this._items.length) {
            this._config.onEmpty && this._config.onEmpty();
            return;
        }
        this._isWorking = true;
        retry(this._items[0])
            .then(function () {
            _this._config.onResolve && _this._config.onResolve(_this._items[0]);
            _this._items.shift();
            _this._isWorking = false;
            _this.processNext();
        })
            .catch(function (error) {
            _this._isWorking = false;
            _this._paused = true;
            _this._config.onFail && _this._config.onFail(_this._items[0], error, function () {
                _this._paused = false;
                _this.processNext();
            }, function () {
                _this._paused = false;
                _this._items.shift();
                _this.processNext();
            }, function () {
                _this._paused = false;
            });
        });
    };
    return DynaRetrySync;
}());
export { DynaRetrySync };
//# sourceMappingURL=DynaRetrySync.js.map