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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULTS = void 0;
var random_1 = __importDefault(require("@vs-org/random"));
var constants_1 = __importDefault(require("@vs-org/random/lib/utils/constants"));
var GENERAL = {
    cookieName: "vs-sess",
    sessionExpiry: 30 * 24 * 60 * 60,
    setCookieHeader: "Set-Cookie",
    randomCharSet: "".concat(constants_1.default.LOWERCASE_ALPHABETE).concat(constants_1.default.UPPERCASE_ALPHABET).concat(constants_1.default.NUMBERS, "/_."),
    sessionDocument: (function () {
        return { key: "", expiry: new Date(), sessionContext: {} };
    })()
};
var DEFAULTS = __assign(__assign({}, GENERAL), { sessionId: (function () {
        return (0, random_1.default)({
            length: 32,
            charset: GENERAL.randomCharSet
        });
    })() });
exports.DEFAULTS = DEFAULTS;
