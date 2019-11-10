(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("dyna-loops"));
	else if(typeof define === 'function' && define.amd)
		define("dyna-retry", ["dyna-loops"], factory);
	else if(typeof exports === 'object')
		exports["dyna-retry"] = factory(require("dyna-loops"));
	else
		root["dyna-retry"] = factory(root["dyna-loops"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_3__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

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
var dyna_loops_1 = __webpack_require__(3);
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


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var DynaRetry_1 = __webpack_require__(0);
exports.DynaRetry = DynaRetry_1.DynaRetry;
exports.retry = DynaRetry_1.retry;
var DynaRetrySync_1 = __webpack_require__(2);
exports.DynaRetrySync = DynaRetrySync_1.DynaRetrySync;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

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
var DynaRetry_1 = __webpack_require__(0);
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
        DynaRetry_1.retry(this._items[0])
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
exports.DynaRetrySync = DynaRetrySync;


/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("dyna-loops");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ })
/******/ ]);
});