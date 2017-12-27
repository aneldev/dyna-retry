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
        this.config = {
            operation: function () { return Promise.resolve(null); },
            maxRetries: 5,
            retryTimeoutBaseMs: 500,
            increasePercentFrom: 20,
            increasePercentTo: 60,
            retryTimeoutMaxMs: 1 * 60 * 1000,
        };
        this.retryNo = 0;
        this.currentDelay = 0;
        this.config = __assign({}, this.config, config);
    }
    DynaRetry.prototype.getDelay = function () {
        if (this.config.delayAlgorithm) {
            this.currentDelay = this.config.delayAlgorithm(this.currentDelay, this.retryNo);
        }
        else {
            this.currentDelay +=
                (this.currentDelay | this.config.retryTimeoutBaseMs)
                    * (dyna_loops_1.random(this.config.increasePercentFrom, this.config.increasePercentTo) / 100);
        }
        if (this.currentDelay > this.config.retryTimeoutMaxMs)
            this.currentDelay = this.config.retryTimeoutMaxMs;
        return this.currentDelay;
    };
    DynaRetry.prototype.start = function () {
        var _this = this;
        var cancel = false;
        var cancelIt = function () { return cancel = true; };
        var lastError = null;
        return new Promise(function (resolve, reject) {
            var tryIt = function () {
                if (cancel) {
                    reject(lastError);
                    return;
                }
                _this.retryNo++;
                _this.config.onRetry && _this.config.onRetry(_this.retryNo, cancelIt);
                _this.config.operation()
                    .then(resolve)
                    .catch(function (error) {
                    lastError = error;
                    _this.config.onFail && _this.config.onFail(_this.retryNo, cancelIt);
                    if (_this.config.maxRetries === null || _this.retryNo < _this.config.maxRetries) {
                        setTimeout(tryIt, _this.getDelay());
                    }
                    else {
                        reject(error);
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
        this.items = [];
        this._isWorking = false;
        this._paused = false; // for internal use only... used on onFail callback when we are waiting the object user to react with "retry", "skip" or "stop",
        this.config = __assign({}, config);
        if (!this.config.onFail) {
            console.error('DynaRetrySync requires to implement the onFail function. See at http://www.github.com/aneldev/dyna-retry');
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
            return this.items.length;
        },
        enumerable: true,
        configurable: true
    });
    DynaRetrySync.prototype.add = function (retryItem) {
        this.items.push(retryItem);
        this.start();
    };
    DynaRetrySync.prototype.start = function () {
        var _this = this;
        if (this._paused)
            return;
        if (this._isWorking)
            return;
        if (!this.items.length) {
            this.config.onEmpty && this.config.onEmpty();
            return;
        }
        this._isWorking = true;
        DynaRetry_1.retry(this.items[0])
            .then(function () {
            _this.config.onResolve && _this.config.onResolve(_this.items[0]);
            _this.items.shift();
            _this._isWorking = false;
            _this.start();
        })
            .catch(function (error) {
            _this._isWorking = false;
            _this._paused = true;
            _this.config.onFail && _this.config.onFail(_this.items[0], error, function () {
                _this._paused = false;
                _this.start();
            }, function () {
                _this._paused = false;
                _this.items.shift();
                _this.start();
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