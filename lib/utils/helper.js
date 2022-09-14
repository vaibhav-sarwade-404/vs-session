"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getObjectKeyFromValue = exports.getRemoveCookieHeaderValue = exports.getDate = void 0;
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
/**
 * This helper function will return first key with value
 * @param obj - Object
 * @param value - value to find
 * @returns {string | undefined}
 */
var getObjectKeyFromValue = function (obj, value) {
    var objKeysArr = Object.keys(obj);
    if (!objKeysArr.length) {
        return;
    }
    return objKeysArr.find(function (objKey) { return obj[objKey] === value; });
};
exports.getObjectKeyFromValue = getObjectKeyFromValue;
