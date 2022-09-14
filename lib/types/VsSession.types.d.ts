export declare type MongoDbHandlerPackage = "mongodb" | "mongoose";
export declare type VsSessionOptions = {
    /**
     * Mongo DB URL - "mongodb://localhost:27017/vs-rate-limiter"
     */
    url: string;
    /**
     * Mongo DB username - if required
     */
    username?: string;
    /**
     * Mongo DB password - if required
     */
    password?: string;
    /**
     * Mongo DB logger level
     */
    loggerLevel?: "debug";
    /**
     * Collection Name for DB
     */
    collectionName?: string;
    /**
     * Secret to hash session id for cookie validations.
     */
    secret: string;
    /**
     * random unique ID generator for session id
     */
    sessionIdGenerator?: Function;
    /**
     * Default is 30 days
     */
    expiresInSeconds?: number;
    /**
     * Cookie options
     */
    cookie: VsSessionCookie;
    /**
     * Cookie options
     */
    mongoDbOperationHandlerPackage: MongoDbHandlerPackage;
    /**
     * Add routes to check session only.
     * If this flag is set with middleware package will just populate session if session cookie is present and has valid session.
     */
    onlyCheckSessionRoutes?: Array<string>;
    /**
     * Add routes to check session only.
     * If this flag is set with middleware package will just populate session if session cookie is present and has valid session.
     *
     * Object key should be route and HTTP method for that route
     *
     * Eg:
     *
     * {
     *  "POST": ["/update-profile"],
     *  "GET": ["/logout"]
     * }
     *
     */
    onlyCheckSessionRoutesWithHTTPMethod?: HttpMethodsRoutesArray;
};
export declare type HttpMethodsRoutesArray = {
    GET?: Array<string>;
    POST?: Array<string>;
    PATHC?: Array<string>;
    DELETE?: Array<string>;
};
/**
 * Generic object key and value
 */
export declare type GenericObject = {
    [key: string]: any;
};
/**
 * Path=/; HttpOnly; Secure; SameSite=None
 */
export declare type VsSessionCookie = {
    name: string;
    path: string;
    domain: string;
    maxAge?: number;
    httpOnly: boolean;
    secure: boolean;
    /**
     * true --> SameSite will be assigned value "Strict"
     * Strict --> browser sends the cookie only for same-site requests
     * Lax --> cookie is not sent on cross-site requests,
     * None --> browser sends the cookie with both cross-site and same-site requests
     *
     * When using sameSite then secure also needs to be set, if this option is provided secure will be set automatically by package
     *
     * Cookies used for storing sensetive information like authentication / authenticated session should have short lifetime with
     * SameSite as "Strict" or "Lax"
     */
    sameSite: true | "Strict" | "Lax" | "None";
    /**
     * Use this header if cookies are coming from custom header.
     * For example if proxy is used and cookies are filtered and application is using differnt header for cookie use this option. So that VsSession can extract cookie from exact header.
     */
    header?: string;
};
/**
 * Generic object
 */
declare type OptionalGenericObject = Partial<Record<string, GenericObject | string>>;
/**
 * Session context object
 */
export declare type SessionContext = OptionalGenericObject;
/**
 * Session document
 */
export declare type VsSessionDocument = {
    key: string;
    sessionContext: OptionalGenericObject;
    expiry: Date;
};
/**
 * Vs Session
 */
export declare type Session = {
    readonly sessionId: string;
    sessionContext: SessionContext;
};
export interface IMongoDbSessionStore {
    createSession: (session: VsSessionDocument) => Promise<VsSessionDocument | undefined | never>;
    updateSession: (session: VsSessionDocument) => Promise<VsSessionDocument | undefined | never>;
    destroySession: (sessionId: string) => Promise<boolean | undefined | never>;
    getSession: (sessionId: string) => Promise<VsSessionDocument | undefined | never>;
}
/**
 * Module Augmentation
 */
declare global {
    namespace Express {
        interface Request {
            session: {
                sessionContext: SessionContext;
                updateSession: (sessionId?: string, sessionContext?: SessionContext) => Promise<void>;
                destroySession: (sessionId?: string) => Promise<boolean | never>;
                getSession: (sessionId?: string) => Promise<SessionContext>;
            };
            sessionId: string;
        }
    }
}
export {};
