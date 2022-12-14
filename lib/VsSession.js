"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var cookie_1 = require("@vs-org/cookie");
var constants_1 = require("./utils/constants");
var helper_1 = require("./utils/helper");
function getMongoDbHandlerPackage(packageName, options) {
    return __awaiter(this, void 0, void 0, function () {
        var VsMongoSession, VsMongooseSession;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(packageName === "mongodb")) return [3 /*break*/, 2];
                    return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require("./VsMongoSession")); })];
                case 1:
                    VsMongoSession = (_a.sent()).default;
                    return [2 /*return*/, VsMongoSession.getInstance(options)];
                case 2: return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require("./VsMongooseSession")); })];
                case 3:
                    VsMongooseSession = (_a.sent()).default;
                    return [2 /*return*/, VsMongooseSession.getInstance(options)];
            }
        });
    });
}
var createSessionCookie = function (createSessionParams) {
    var sessionId = createSessionParams.sessionId, maxAge = createSessionParams.maxAge, cookieName = createSessionParams.cookieName, options = createSessionParams.options;
    var cookieOptions = options.cookie || {};
    var _a = cookieOptions.domain, domain = _a === void 0 ? "" : _a, _b = cookieOptions.httpOnly, httpOnly = _b === void 0 ? true : _b, _c = cookieOptions.path, path = _c === void 0 ? "/" : _c, _d = cookieOptions.secure, secure = _d === void 0 ? false : _d, sameSite = cookieOptions.sameSite;
    var signedSessionCookie = (0, cookie_1.sign)(sessionId || "", options.secret);
    var sessionCookie = (0, cookie_1.createCookie)({
        name: cookieName,
        value: decodeURIComponent(signedSessionCookie),
        "Max-Age": maxAge,
        Domain: domain,
        HttpOnly: httpOnly,
        Path: path,
        Secure: secure,
        SameSite: sameSite
    });
    return sessionCookie;
};
var updateSession = function (updateSessionParams) { return __awaiter(void 0, void 0, void 0, function () {
    var req, resp, expiryInMilliSeconds, cookieName, vsMongoSessionStore, options, originalSessionId;
    return __generator(this, function (_a) {
        req = updateSessionParams.req, resp = updateSessionParams.resp, expiryInMilliSeconds = updateSessionParams.expiryInMilliSeconds, cookieName = updateSessionParams.cookieName, vsMongoSessionStore = updateSessionParams.vsMongoSessionStore, options = updateSessionParams.options;
        originalSessionId = req.sessionId;
        return [2 /*return*/, function (sessionId, sessionContext) { return __awaiter(void 0, void 0, void 0, function () {
                var sessionCookie;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (sessionId &&
                                (!sessionContext ||
                                    String.prototype.toString.call(sessionContext) === "[object Object]")) {
                                throw new TypeError("SessionContext should be an object");
                            }
                            if (sessionId && originalSessionId !== sessionId) {
                                throw new TypeError("sessionId provided is not a valid sessionId for current session");
                            }
                            if (originalSessionId !== req.sessionId) {
                                throw new TypeError("sessionId updated in request is not a valid sessionId for current session");
                            }
                            if (!sessionId && req.session && req.sessionId) {
                                sessionId = req.sessionId;
                                sessionContext = req.session.sessionContext;
                            }
                            return [4 /*yield*/, vsMongoSessionStore.updateSession({
                                    key: sessionId || "",
                                    expiry: new Date(Date.now() + expiryInMilliSeconds),
                                    sessionContext: sessionContext || {}
                                })];
                        case 1:
                            _a.sent();
                            sessionCookie = createSessionCookie({
                                sessionId: sessionId || "",
                                maxAge: expiryInMilliSeconds / 1000,
                                cookieName: cookieName,
                                options: options
                            });
                            resp.header(constants_1.DEFAULTS.setCookieHeader, sessionCookie);
                            return [2 /*return*/];
                    }
                });
            }); }];
    });
}); };
var destroySession = function (destroySessionParams) { return __awaiter(void 0, void 0, void 0, function () {
    var req, resp, cookieName, vsMongoSessionStore, originalSessionId;
    return __generator(this, function (_a) {
        req = destroySessionParams.req, resp = destroySessionParams.resp, cookieName = destroySessionParams.cookieName, vsMongoSessionStore = destroySessionParams.vsMongoSessionStore;
        originalSessionId = req.sessionId;
        return [2 /*return*/, function (sessionId) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (sessionId && originalSessionId !== sessionId) {
                                throw new TypeError("sessionId provided is not a valid sessionId for current session");
                            }
                            if (originalSessionId !== req.sessionId) {
                                throw new TypeError("sessionId updated in request is not a valid sessionId for current session");
                            }
                            if (!sessionId) {
                                sessionId = req.sessionId;
                            }
                            return [4 /*yield*/, vsMongoSessionStore.destroySession(sessionId)];
                        case 1:
                            _a.sent();
                            resp.header(constants_1.DEFAULTS.setCookieHeader, (0, helper_1.getRemoveCookieHeaderValue)(cookieName));
                            return [2 /*return*/, true];
                    }
                });
            }); }];
    });
}); };
var getSession = function (req, vsMongoSessionStore) { return __awaiter(void 0, void 0, void 0, function () {
    var originalSessionId;
    return __generator(this, function (_a) {
        originalSessionId = req.sessionId;
        return [2 /*return*/, function (sessionId) { return __awaiter(void 0, void 0, void 0, function () {
                var session;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (sessionId && originalSessionId !== sessionId) {
                                throw new TypeError("sessionId provided is not a valid sessionId for current session");
                            }
                            if (originalSessionId !== req.sessionId) {
                                throw new TypeError("sessionId updated in request is not a valid sessionId for current session");
                            }
                            if (!sessionId && !req.sessionId) {
                                return [2 /*return*/, {
                                        sessionId: "",
                                        sessionContext: {}
                                    }];
                            }
                            if (!sessionId && req.sessionId) {
                                return [2 /*return*/, {
                                        sessionId: req.sessionId,
                                        sessionContext: req.session.sessionContext
                                    }];
                            }
                            return [4 /*yield*/, vsMongoSessionStore.getSession(sessionId || "")];
                        case 1:
                            session = (_a.sent()) || {
                                key: "",
                                sessionContext: {}
                            };
                            return [2 /*return*/, {
                                    sessionId: session.key || "",
                                    sessionContext: session.sessionContext
                                }];
                    }
                });
            }); }];
    });
}); };
var encrichRequest = function (encrichRequestParams) { return __awaiter(void 0, void 0, void 0, function () {
    var req, resp, session, expiryInMilliSeconds, cookieName, options, vsMongoSessionStore, _a;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                req = encrichRequestParams.req, resp = encrichRequestParams.resp, session = encrichRequestParams.session, expiryInMilliSeconds = encrichRequestParams.expiryInMilliSeconds, cookieName = encrichRequestParams.cookieName, options = encrichRequestParams.options, vsMongoSessionStore = encrichRequestParams.vsMongoSessionStore;
                req.sessionId = session.sessionId;
                _a = req;
                _b = {
                    sessionContext: session.sessionContext || {}
                };
                return [4 /*yield*/, updateSession({
                        req: req,
                        resp: resp,
                        options: options,
                        expiryInMilliSeconds: expiryInMilliSeconds,
                        cookieName: cookieName,
                        vsMongoSessionStore: vsMongoSessionStore
                    })];
            case 1:
                _b.updateSession = _c.sent();
                return [4 /*yield*/, destroySession({
                        req: req,
                        resp: resp,
                        cookieName: cookieName,
                        vsMongoSessionStore: vsMongoSessionStore
                    })];
            case 2:
                _b.destroySession = _c.sent();
                return [4 /*yield*/, getSession(req, vsMongoSessionStore)];
            case 3:
                _a.session = (_b.getSession = _c.sent(),
                    _b);
                return [2 /*return*/];
        }
    });
}); };
var VsSession = function (options) {
    if (!options.url) {
        throw new TypeError("options.url is missing");
    }
    if (!options.secret) {
        throw new TypeError("secret is missing");
    }
    if (!options.cookie ||
        Object.prototype.toString.call(options.cookie) !== "[object Object]") {
        throw new TypeError("Cookie option should be a valid object");
    }
    if (options.onlyCheckSessionRoutes &&
        !Array.isArray(options.onlyCheckSessionRoutes)) {
        throw new TypeError("onlyCheckSessionRoutes should be a valid array");
    }
    if (options.expiresInSeconds &&
        typeof options.expiresInSeconds !== "number") {
        throw new TypeError("expiresInSeconds should be a number");
    }
    if (options.cookie.maxAge && typeof options.cookie.maxAge !== "number") {
        throw new TypeError("cookie.maxAge should be a number");
    }
    if (options.onlyCheckSessionRoutesWithHTTPMethod &&
        Object.prototype.toString.call(options.onlyCheckSessionRoutesWithHTTPMethod) !== "[object Object]") {
        throw new TypeError("onlyCheckSessionRoutesWithHTTPMethod should be a valid object");
    }
    var cookieOptions = options.cookie || {};
    var cookieName = cookieOptions.name || constants_1.DEFAULTS.cookieName;
    var cookieHeader = cookieOptions.header || "cookie";
    var maxAge = options.expiresInSeconds
        ? options.expiresInSeconds
        : cookieOptions.maxAge
            ? cookieOptions.maxAge
            : constants_1.DEFAULTS.sessionExpiry;
    var expiryInMilliSeconds = maxAge * 1000;
    var vsMongoSessionStore;
    var routes = [];
    if (options.onlyCheckSessionRoutes &&
        Array.isArray(options.onlyCheckSessionRoutes)) {
        routes = options.onlyCheckSessionRoutes;
    }
    return function (req, resp, next) { return __awaiter(void 0, void 0, void 0, function () {
        var createSession, cookies, checkSessionHttpMethods, requestMethod, onlyCheckSession, sessionCookie, session, sessionId, session, sessionCookie;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!!vsMongoSessionStore) return [3 /*break*/, 2];
                    return [4 /*yield*/, getMongoDbHandlerPackage(options.mongoDbOperationHandlerPackage || "mongodb", options)];
                case 1:
                    vsMongoSessionStore = _b.sent();
                    _b.label = 2;
                case 2:
                    createSession = function (_session) { return __awaiter(void 0, void 0, void 0, function () {
                        var session, error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, vsMongoSessionStore.createSession(_session)];
                                case 1:
                                    session = _a.sent();
                                    if (session) {
                                        return [2 /*return*/, session];
                                    }
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_1 = _a.sent();
                                    throw new Error("Couldn't create session");
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); };
                    cookies = ((_a = req.headers[cookieHeader]) === null || _a === void 0 ? void 0 : _a.toString()) || "";
                    if (options.onlyCheckSessionRoutesWithHTTPMethod) {
                        checkSessionHttpMethods = Object.keys(options.onlyCheckSessionRoutesWithHTTPMethod);
                        if (checkSessionHttpMethods.length) {
                            requestMethod = ((0, helper_1.getObjectKeyFromValue)(req.route.methods || {}, true) || "").toUpperCase();
                            if (requestMethod && checkSessionHttpMethods.includes(requestMethod)) {
                                // No need to keep every entry unique as only check on routes array is to check if route is present
                                routes = routes.concat(options.onlyCheckSessionRoutesWithHTTPMethod[requestMethod] || []);
                            }
                        }
                    }
                    onlyCheckSession = routes.includes(req.route.path);
                    if (!(cookies || (cookies && onlyCheckSession))) return [3 /*break*/, 7];
                    sessionCookie = (0, cookie_1.getCookie)(cookies, cookieName, { secret: options.secret }) || "";
                    if (!sessionCookie) return [3 /*break*/, 6];
                    return [4 /*yield*/, vsMongoSessionStore.getSession(sessionCookie)];
                case 3:
                    session = _b.sent();
                    if (!session) return [3 /*break*/, 5];
                    return [4 /*yield*/, encrichRequest({
                            req: req,
                            resp: resp,
                            session: {
                                sessionId: session.key || "",
                                sessionContext: session.sessionContext || {}
                            },
                            options: options,
                            expiryInMilliSeconds: expiryInMilliSeconds,
                            cookieName: cookieName,
                            vsMongoSessionStore: vsMongoSessionStore
                        })];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    resp.header(constants_1.DEFAULTS.setCookieHeader, (0, helper_1.getRemoveCookieHeaderValue)(cookieName));
                    _b.label = 6;
                case 6: return [3 /*break*/, 10];
                case 7:
                    if (!!onlyCheckSession) return [3 /*break*/, 10];
                    sessionId = constants_1.DEFAULTS.sessionId();
                    if (typeof options.sessionIdGenerator === "function") {
                        sessionId = options.sessionIdGenerator();
                    }
                    return [4 /*yield*/, createSession({
                            key: sessionId,
                            expiry: new Date(Date.now() + expiryInMilliSeconds),
                            sessionContext: {}
                        })];
                case 8:
                    session = _b.sent();
                    if (!session) return [3 /*break*/, 10];
                    sessionCookie = createSessionCookie({
                        sessionId: sessionId,
                        maxAge: maxAge,
                        cookieName: cookieName,
                        options: options
                    });
                    resp.header(constants_1.DEFAULTS.setCookieHeader, sessionCookie);
                    return [4 /*yield*/, encrichRequest({
                            req: req,
                            resp: resp,
                            session: {
                                sessionId: session.key || "",
                                sessionContext: {}
                            },
                            options: options,
                            expiryInMilliSeconds: expiryInMilliSeconds,
                            cookieName: cookieName,
                            vsMongoSessionStore: vsMongoSessionStore
                        })];
                case 9:
                    _b.sent();
                    _b.label = 10;
                case 10:
                    next();
                    return [2 /*return*/];
            }
        });
    }); };
};
exports.default = VsSession;
