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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importStar(require("mongoose"));
var constants_1 = require("./utils/constants");
//"mongodb://localhost:27017/vs-session"
var getDbName = function (dbUrl) {
    return dbUrl.split("/").pop();
};
var VsSessionSchema = new mongoose_1.Schema({
    key: { type: String, require: true, index: true },
    expiry: {
        type: Date,
        require: true,
        default: null,
        index: true,
        expires: 0
    },
    sessionContext: { type: Object, require: true }
});
var VsMongooseSession = /** @class */ (function () {
    function VsMongooseSession(options) {
        this.defaultResetInSeconds = 30 * 24 * 60 * 60;
        var _a = options.collectionName, collectionName = _a === void 0 ? "session_".concat(getDbName(options.url)) : _a, _b = options.expiresInSeconds, expiresInSeconds = _b === void 0 ? this.defaultResetInSeconds : _b, restOptions = __rest(options, ["collectionName", "expiresInSeconds"]);
        this.options = __assign({ collectionName: collectionName, expiresInSeconds: expiresInSeconds }, restOptions);
        this.sessionModel = mongoose_1.default.model(collectionName, VsSessionSchema, collectionName);
        this.connect();
    }
    /**
     * connect
     */
    VsMongooseSession.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, url, username, password, loggerLevel, collectionName, connectionOptions, dbName, client;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.options, url = _a.url, username = _a.username, password = _a.password, loggerLevel = _a.loggerLevel, collectionName = _a.collectionName;
                        connectionOptions = {};
                        if (username && password) {
                            connectionOptions["auth"] = { username: username, password: password };
                            dbName = getDbName(url);
                            connectionOptions.authSource = dbName || collectionName;
                        }
                        if (loggerLevel === "debug") {
                            mongoose_1.default.set("debug", true);
                        }
                        return [4 /*yield*/, mongoose_1.default
                                .connect(url, __assign({}, connectionOptions))
                                .catch(function (err) {
                                console.error("Something went wrong while connecting to DB with error: ".concat(err));
                                throw new Error("Unable to connect to DB");
                            })];
                    case 1:
                        client = _b.sent();
                        if (client) {
                            return [2 /*return*/, client];
                        }
                        else {
                            throw new Error("Unable to connect to DB");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * getSession
     */
    VsMongooseSession.prototype.getSession = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sessionModel.findOne({ key: sessionId })];
                    case 1:
                        session = _a.sent();
                        return [2 /*return*/, {
                                key: (session === null || session === void 0 ? void 0 : session.key) || "",
                                expiry: (session === null || session === void 0 ? void 0 : session.expiry) || new Date(),
                                sessionContext: (session === null || session === void 0 ? void 0 : session.sessionContext) || {}
                            }];
                }
            });
        });
    };
    /**
     * createSession
     */
    VsMongooseSession.prototype.createSession = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionId, _a, key, expiry, _b, sessionContext, _session;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        sessionId = constants_1.DEFAULTS.sessionId;
                        _a = session.key, key = _a === void 0 ? sessionId : _a, expiry = session.expiry, _b = session.sessionContext, sessionContext = _b === void 0 ? {} : _b;
                        return [4 /*yield*/, this.sessionModel.findOneAndUpdate({
                                key: key
                            }, {
                                $set: {
                                    expiry: expiry,
                                    sessionContext: sessionContext
                                }
                            }, { upsert: true, new: true })];
                    case 1:
                        _session = _c.sent();
                        return [2 /*return*/, {
                                key: (_session === null || _session === void 0 ? void 0 : _session.key) || "",
                                expiry: (_session === null || _session === void 0 ? void 0 : _session.expiry) || new Date(),
                                sessionContext: (_session === null || _session === void 0 ? void 0 : _session.sessionContext) || {}
                            }];
                }
            });
        });
    };
    /**
     * updateSession
     */
    VsMongooseSession.prototype.updateSession = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var _session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sessionModel.findOneAndUpdate({
                            key: session.key
                        }, session, { new: true })];
                    case 1:
                        _session = _a.sent();
                        return [2 /*return*/, {
                                key: (_session === null || _session === void 0 ? void 0 : _session.key) || "",
                                expiry: (_session === null || _session === void 0 ? void 0 : _session.expiry) || new Date(),
                                sessionContext: (_session === null || _session === void 0 ? void 0 : _session.sessionContext) || {}
                            }];
                }
            });
        });
    };
    /**
     * destroySession
     */
    VsMongooseSession.prototype.destroySession = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, acknowledged, _c, deletedCount;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.sessionModel.deleteOne({ key: sessionId })];
                    case 1:
                        _a = _d.sent(), _b = _a.acknowledged, acknowledged = _b === void 0 ? false : _b, _c = _a.deletedCount, deletedCount = _c === void 0 ? 0 : _c;
                        return [2 /*return*/, !!acknowledged && !!deletedCount];
                }
            });
        });
    };
    return VsMongooseSession;
}());
exports.default = VsMongooseSession;
