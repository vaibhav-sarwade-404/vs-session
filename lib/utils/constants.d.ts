declare const DEFAULTS: {
    sessionId: string;
    cookieName: string;
    sessionExpiry: number;
    setCookieHeader: string;
    randomCharSet: string;
    sessionDocument: {
        key: string;
        expiry: Date;
        sessionContext: {};
    };
};
export { DEFAULTS };
