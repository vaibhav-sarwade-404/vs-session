import { createCookie, getCookie, sign } from "@vs-org/cookie";
import { Request, Response, NextFunction } from "express";

import {
  HttpMethodsRoutesArray,
  IMongoDbSessionStore,
  MongoDbHandlerPackage,
  Session,
  SessionContext,
  VsSessionDocument,
  VsSessionOptions
} from "./types/VsSession.types";
import { DEFAULTS } from "./utils/constants";
import {
  getObjectKeyFromValue,
  getRemoveCookieHeaderValue
} from "./utils/helper";

async function getMongoDbHandlerPackage(
  packageName: MongoDbHandlerPackage,
  options: VsSessionOptions
): Promise<IMongoDbSessionStore> {
  if (packageName === "mongodb") {
    const VsMongoSession = (await import("./VsMongoSession")).default;
    return VsMongoSession.getInstance(options);
  }
  const VsMongooseSession = (await import("./VsMongooseSession")).default;
  return VsMongooseSession.getInstance(options);
}

const createSessionCookie = (createSessionParams: {
  sessionId: string;
  maxAge: number;
  cookieName: string;
  options: VsSessionOptions;
}): string | never => {
  const { sessionId, maxAge, cookieName, options } = createSessionParams;
  const cookieOptions = options.cookie || {};
  const {
    domain = "",
    httpOnly = true,
    path = "/",
    secure = false,
    sameSite
  } = cookieOptions;
  const signedSessionCookie = sign(sessionId || "", options.secret);
  const sessionCookie = createCookie({
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

const updateSession = async (updateSessionParams: {
  req: Request;
  resp: Response;
  options: VsSessionOptions;
  expiryInMilliSeconds: number;
  cookieName: string;
  vsMongoSessionStore: IMongoDbSessionStore;
}) => {
  const {
    req,
    resp,
    expiryInMilliSeconds,
    cookieName,
    vsMongoSessionStore,
    options
  } = updateSessionParams;
  const originalSessionId = req.sessionId;
  return async (
    sessionId?: string,
    sessionContext?: SessionContext
  ): Promise<void | never> => {
    if (
      sessionId &&
      (!sessionContext ||
        String.prototype.toString.call(sessionContext) === "[object Object]")
    ) {
      throw new TypeError(`SessionContext should be an object`);
    }
    if (sessionId && originalSessionId !== sessionId) {
      throw new TypeError(
        `sessionId provided is not a valid sessionId for current session`
      );
    }
    if (originalSessionId !== req.sessionId) {
      throw new TypeError(
        `sessionId updated in request is not a valid sessionId for current session`
      );
    }
    if (!sessionId && req.session && req.sessionId) {
      sessionId = req.sessionId;
      sessionContext = req.session.sessionContext;
    }
    await vsMongoSessionStore.updateSession({
      key: sessionId || "",
      expiry: new Date(Date.now() + expiryInMilliSeconds),
      sessionContext: sessionContext || {}
    });
    const sessionCookie = createSessionCookie({
      sessionId: sessionId || "",
      maxAge: expiryInMilliSeconds / 1000,
      cookieName,
      options
    });
    resp.header(DEFAULTS.setCookieHeader, sessionCookie);
  };
};

const destroySession = async (destroySessionParams: {
  req: Request;
  resp: Response;
  cookieName: string;
  vsMongoSessionStore: IMongoDbSessionStore;
}) => {
  const { req, resp, cookieName, vsMongoSessionStore } = destroySessionParams;
  const originalSessionId = req.sessionId;
  return async (sessionId?: string): Promise<boolean | never> => {
    if (sessionId && originalSessionId !== sessionId) {
      throw new TypeError(
        `sessionId provided is not a valid sessionId for current session`
      );
    }
    if (originalSessionId !== req.sessionId) {
      throw new TypeError(
        `sessionId updated in request is not a valid sessionId for current session`
      );
    }
    if (!sessionId) {
      sessionId = req.sessionId;
    }
    await vsMongoSessionStore.destroySession(sessionId);
    resp.header(
      DEFAULTS.setCookieHeader,
      getRemoveCookieHeaderValue(cookieName)
    );
    return true;
  };
};

const getSession = async (
  req: Request,
  vsMongoSessionStore: IMongoDbSessionStore
) => {
  const originalSessionId = req.sessionId;
  return async (sessionId?: string): Promise<Session | never> => {
    if (sessionId && originalSessionId !== sessionId) {
      throw new TypeError(
        `sessionId provided is not a valid sessionId for current session`
      );
    }
    if (originalSessionId !== req.sessionId) {
      throw new TypeError(
        `sessionId updated in request is not a valid sessionId for current session`
      );
    }
    if (!sessionId && !req.sessionId) {
      return {
        sessionId: "",
        sessionContext: {}
      };
    }
    if (!sessionId && req.sessionId) {
      return {
        sessionId: req.sessionId,
        sessionContext: req.session.sessionContext
      };
    }
    const session = (await vsMongoSessionStore.getSession(sessionId || "")) || {
      key: "",
      sessionContext: {}
    };
    return {
      sessionId: session.key || "",
      sessionContext: session.sessionContext
    };
  };
};

const encrichRequest = async (encrichRequestParams: {
  req: Request;
  resp: Response;
  session: Session;
  options: VsSessionOptions;
  expiryInMilliSeconds: number;
  cookieName: string;
  vsMongoSessionStore: IMongoDbSessionStore;
}) => {
  const {
    req,
    resp,
    session,
    expiryInMilliSeconds,
    cookieName,
    options,
    vsMongoSessionStore
  } = encrichRequestParams;
  req.sessionId = session.sessionId;
  req.session = {
    sessionContext: session.sessionContext || {},
    updateSession: await updateSession({
      req,
      resp,
      options,
      expiryInMilliSeconds,
      cookieName,
      vsMongoSessionStore
    }),
    destroySession: await destroySession({
      req,
      resp,
      cookieName,
      vsMongoSessionStore
    }),
    getSession: await getSession(req, vsMongoSessionStore)
  };
};

const VsSession = (options: VsSessionOptions) => {
  if (!options.url) {
    throw new TypeError(`options.url is missing`);
  }
  if (!options.secret) {
    throw new TypeError(`secret is missing`);
  }
  if (
    !options.cookie ||
    Object.prototype.toString.call(options.cookie) !== "[object Object]"
  ) {
    throw new TypeError(`Cookie option should be a valid object`);
  }

  if (
    options.onlyCheckSessionRoutes &&
    !Array.isArray(options.onlyCheckSessionRoutes)
  ) {
    throw new TypeError(`onlyCheckSessionRoutes should be a valid array`);
  }

  if (
    options.expiresInSeconds &&
    typeof options.expiresInSeconds !== "number"
  ) {
    throw new TypeError(`expiresInSeconds should be a number`);
  }

  if (options.cookie.maxAge && typeof options.cookie.maxAge !== "number") {
    throw new TypeError(`cookie.maxAge should be a number`);
  }

  if (
    options.onlyCheckSessionRoutesWithHTTPMethod &&
    Object.prototype.toString.call(
      options.onlyCheckSessionRoutesWithHTTPMethod
    ) !== "[object Object]"
  ) {
    throw new TypeError(
      `onlyCheckSessionRoutesWithHTTPMethod should be a valid object`
    );
  }
  const cookieOptions = options.cookie || {};
  const cookieName = cookieOptions.name || DEFAULTS.cookieName;
  const cookieHeader = cookieOptions.header || "cookie";

  const maxAge = options.expiresInSeconds
    ? options.expiresInSeconds
    : cookieOptions.maxAge
    ? cookieOptions.maxAge
    : DEFAULTS.sessionExpiry;
  const expiryInMilliSeconds = maxAge * 1000;

  let vsMongoSessionStore: IMongoDbSessionStore;
  let routes: Array<string> = [];

  if (
    options.onlyCheckSessionRoutes &&
    Array.isArray(options.onlyCheckSessionRoutes)
  ) {
    routes = options.onlyCheckSessionRoutes;
  }

  return async (req: Request, resp: Response, next: NextFunction) => {
    if (!vsMongoSessionStore) {
      vsMongoSessionStore = await getMongoDbHandlerPackage(
        options.mongoDbOperationHandlerPackage || "mongodb",
        options
      );
    }

    const createSession = async (_session: VsSessionDocument) => {
      try {
        const session = await vsMongoSessionStore.createSession(_session);
        if (session) {
          return session;
        }
      } catch (error) {
        throw new Error(`Couldn't create session`);
      }
    };

    const cookies = req.headers[cookieHeader]?.toString() || "";
    if (options.onlyCheckSessionRoutesWithHTTPMethod) {
      const checkSessionHttpMethods = Object.keys(
        options.onlyCheckSessionRoutesWithHTTPMethod
      );
      if (checkSessionHttpMethods.length) {
        const requestMethod = (
          getObjectKeyFromValue(req.route.methods || {}, true) || ""
        ).toUpperCase();
        if (requestMethod && checkSessionHttpMethods.includes(requestMethod)) {
          // No need to keep every entry unique as only check on routes array is to check if route is present
          routes = routes.concat(
            options.onlyCheckSessionRoutesWithHTTPMethod[
              requestMethod as keyof HttpMethodsRoutesArray
            ] || []
          );
        }
      }
    }
    let onlyCheckSession = routes.includes(req.route.path);
    if (cookies || (cookies && onlyCheckSession)) {
      const sessionCookie =
        getCookie(cookies, cookieName, { secret: options.secret }) || "";
      if (sessionCookie) {
        const session = await vsMongoSessionStore.getSession(sessionCookie);
        if (session) {
          await encrichRequest({
            req,
            resp,
            session: {
              sessionId: session.key || "",
              sessionContext: session.sessionContext || {}
            },
            options,
            expiryInMilliSeconds,
            cookieName,
            vsMongoSessionStore
          });
        } else {
          resp.header(
            DEFAULTS.setCookieHeader,
            getRemoveCookieHeaderValue(cookieName)
          );
        }
      }
    } else if (!onlyCheckSession) {
      let sessionId = DEFAULTS.sessionId();
      if (typeof options.sessionIdGenerator === "function") {
        sessionId = options.sessionIdGenerator();
      }
      const session = await createSession({
        key: sessionId,
        expiry: new Date(Date.now() + expiryInMilliSeconds),
        sessionContext: {}
      });
      if (session) {
        const sessionCookie = createSessionCookie({
          sessionId,
          maxAge,
          cookieName,
          options
        });
        resp.header(DEFAULTS.setCookieHeader, sessionCookie);
        await encrichRequest({
          req,
          resp,
          session: {
            sessionId: session.key || "",
            sessionContext: {}
          },
          options,
          expiryInMilliSeconds,
          cookieName,
          vsMongoSessionStore
        });
      }
    }
    next();
  };
};

export default VsSession;
