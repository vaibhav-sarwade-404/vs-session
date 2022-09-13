import { createCookie, getCookie, verify, sign } from "@vs-org/cookie";
import { Request, Response, NextFunction } from "express";

import {
  IMongoDbSessionStore,
  MongoDbHandlerPackage,
  Session,
  SessionContext,
  VsSessionDocument,
  VsSessionOptions
} from "./types/VsSession.types";
import { DEFAULTS } from "./utils/constants";
import { getRemoveCookieHeaderValue } from "./utils/helper";

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

const VsSession = (options: VsSessionOptions) => {
  if (!options.url) {
    throw new TypeError(`options.url is missing`);
  }
  if (!options.secret) {
    throw new TypeError(`secret is missing`);
  }
  const cookieName = options.cookie.name || DEFAULTS.cookieName;
  let vsMongoSessionStore: IMongoDbSessionStore;
  return async (req: Request, resp: Response, next: NextFunction) => {
    if (!vsMongoSessionStore) {
      vsMongoSessionStore = await getMongoDbHandlerPackage(
        options.mongoDbOperationHandlerPackage || "mongodb",
        options
      );
    }

    const encrichRequest = async (
      req: Request,
      resp: Response,
      session: Session
    ) => {
      req.sessionId = session.sessionId;
      req.session = {
        sessionContext: session.sessionContext || {},
        updateSession: await updateSession(req, options, vsMongoSessionStore),
        destroySession: await destroySession(req, resp, vsMongoSessionStore),
        getSession: await getSession(req, vsMongoSessionStore)
      };
    };

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

    const updateSession = async (
      req: Request,
      options: VsSessionOptions,
      vsMongoSessionStore: IMongoDbSessionStore
    ) => {
      const originalSessionId = req.sessionId;
      return async (
        sessionId?: string,
        sessionContext?: SessionContext
      ): Promise<void | never> => {
        if (
          sessionId &&
          (!sessionContext ||
            String.prototype.toString.call(sessionContext) ===
              "[object Object]")
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
        const expiry = options.expiresInSeconds
          ? options.expiresInSeconds * 1000
          : DEFAULTS.sessionExpiry;
        if (!sessionId && req.session && req.sessionId) {
          sessionId = req.sessionId;
          sessionContext = req.session.sessionContext;
        }
        await vsMongoSessionStore.updateSession({
          key: sessionId || "",
          expiry: new Date(Date.now() + expiry),
          sessionContext: sessionContext || {}
        });
      };
    };

    const destroySession = async (
      req: Request,
      resp: Response,
      vsMongoSessionStore: IMongoDbSessionStore
    ) => {
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
        let sessionContext = {};
        if (!sessionId && req.sessionId) {
          return {
            sessionId: req.sessionId,
            sessionContext: req.session.sessionContext
          };
        }
        const session = (await vsMongoSessionStore.getSession(
          sessionId || ""
        )) || { key: "", sessionContext: {} };
        return {
          sessionId: session.key || "",
          sessionContext: session.sessionContext
        };
      };
    };

    const cookies = req.headers.cookie || "";
    const onlyCheckSession =
      options.onlyCheckSessionRoutes &&
      Array.isArray(options.onlyCheckSessionRoutes) &&
      options.onlyCheckSessionRoutes.includes(req.route.path);
    if (cookies || (cookies && onlyCheckSession)) {
      const sessionCookie =
        getCookie(cookies, cookieName, { secret: options.secret }) || "";
      if (sessionCookie) {
        const session = await vsMongoSessionStore.getSession(sessionCookie);
        if (session) {
          await encrichRequest(req, resp, {
            sessionId: session.key || "",
            sessionContext: session.sessionContext || {}
          });
        } else {
          resp.header(
            DEFAULTS.setCookieHeader,
            getRemoveCookieHeaderValue(cookieName)
          );
        }
      }
    } else if (!onlyCheckSession) {
      const {
        domain = "",
        maxAge = DEFAULTS.sessionExpiry,
        httpOnly = true,
        path = "/",
        secure = false,
        sameSite
      } = options.cookie || {};
      let sessionId = DEFAULTS.sessionId();
      if (typeof options.sessionIdGenerator === "function") {
        sessionId = options.sessionIdGenerator();
      }
      const session = await createSession({
        key: sessionId,
        expiry: new Date(Date.now() + maxAge * 1000),
        sessionContext: {}
      });
      if (session) {
        const signedSessionCookie = sign(session.key || "", options.secret);
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
        resp.header(DEFAULTS.setCookieHeader, sessionCookie);
        await encrichRequest(req, resp, {
          sessionId: session.key || "",
          sessionContext: {}
        });
      }
    }
    next();
  };
};

export default VsSession;
