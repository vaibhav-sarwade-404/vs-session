"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRemoveCookieHeaderValue = exports.getDate = void 0;
var cookie_1 = require("@vs-org/cookie");
var getDate = function (daysAfter) {
    if (daysAfter) {
        return new Date(Date.now() + daysAfter * 24 * 60 * 60 * 1000);
    }
    return new Date();
};
exports.getDate = getDate;
var getRemoveCookieHeaderValue = function (cookieName) {
    return (0, cookie_1.createCookie)({
        name: cookieName,
        value: "",
        "Max-Age": 0
    });
};
exports.getRemoveCookieHeaderValue = getRemoveCookieHeaderValue;
