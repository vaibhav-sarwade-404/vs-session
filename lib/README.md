# vs-session

This is simple express session management middleware. Mongo DB is used as session store.

## Usage

1. Create sessions

```
// CJS
import VsSession from "@vs-org/session";

// Module
const VsSession =  require("@vs-org/session").default;

const vsSession = VsSession({
    url: "mongodb://localhost:27017/vs-rate-limiter",
    collectionName: "login-session",
    secret: "This is session secret",
    cookie: {
      domain: "",
      maxAge: 86400,
      httpOnly: false,
      name: "vs-session",
      path: "/",
      secure: false
    }
  });

  app.get("/path1", vsSession, async (req: Request, resp: Response) => {
    return resp.send("Login success response");
  });

```

<br/>

2. Only update sessions

   a) If use case is only to check session and update it. Then `onlyCheckSessionRoutes` option can be used<br/>
   b) `onlyCheckSessionRoutes` does not contain present route then new session will be created for the request as it is used as middlware.<br/>
   c) Now we can check if session is there in express `request`, if yes then update `sessionContext` and to save it back to session store call `updateSession` on session.

```
// CJS
import VsSession from "@vs-org/session";

// Module
const VsSession =  require("@vs-org/session").default;

const vsSession = VsSession({
    url: "mongodb://localhost:27017/vs-rate-limiter",
    collectionName: "login-session",
    secret: "This is session secret",
    cookie: {
      domain: "",
      maxAge: 86400,
      httpOnly: false,
      name: "vs-session",
      path: "/",
      secure: false
    },
    onlyCheckSessionRoutesRoutes: ["/update-session", "/logout"]
  });

  app.get(
    "/update-session",
    vsSession,
    async (req: Request, resp: Response) => {
      if (req.session) {
        req.session.sessionContext.user = {
          username: "user1-username",
          name: "John Doe"
        };
        await req.session.updateSession();
      }
      return resp.send("Update session success response");
    }
  );

```

<br/>

3. Update session if present, or else create and update session

   a) If use case is to get current session or create new session then `onlyCheckSessionRoutes` option can be skipped or route can be removed from `onlyCheckSessionRoutes` array, `VsSession` will check if session cookie is present.<br/>
   b) If it is present express `request` will be enriched with current session and session context.<br/>
   c) Now we can update session and to save it back to session store call `updateSession` on session.

```
// CJS
import VsSession from "@vs-org/session";

// Module
const VsSession =  require("@vs-org/session").default;

const vsSession = VsSession({
    url: "mongodb://localhost:27017/vs-rate-limiter",
    collectionName: "login-session",
    secret: "This is session secret",
    cookie: {
      domain: "",
      maxAge: 86400,
      httpOnly: false,
      name: "vs-session",
      path: "/",
      secure: false
    },
    onlyCheckSessionRoutesRoutes: ["/logout"]
  });

  app.get(
    "/update-session",
    vsSession,
    async (req: Request, resp: Response) => {
      if (req.session) {
        req.session.sessionContext.user = {
          username: "user1-username",
          name: "John Doe"
        };
        await req.session.updateSession();
      }
      return resp.send("Update session success response");
    }
  );

```

<br/>

4. Delete session

```
// CJS
import VsSession from "@vs-org/session";

// Module
const VsSession =  require("@vs-org/session").default;

const vsSession = VsSession({
    url: "mongodb://localhost:27017/vs-rate-limiter",
    collectionName: "login-session",
    secret: "This is session secret",
    cookie: {
      domain: "",
      maxAge: 86400,
      httpOnly: false,
      name: "vs-session",
      path: "/",
      secure: false
    },
    onlyCheckSessionRoutesRoutes: ["/logout"]
  });

  app.get("/logout", vsSession, async (req: Request, resp: Response) => {
    if (req.session) {
      await req.session.destroySession();
    }
    return resp.send("Logout session success response");
  });

```

<br/>

## Examples

1. Standard OIDC flow `/authorize` request

   a) If user is already logged in `/authorize` should redirect user to `callback` with response type from `/authorize` call. <br/>
   b) If user is not logged in (sesion is not present) then user should be redirected to login page.

```
// CJS
import VsSession from "@vs-org/session";

// Module
const VsSession =  require("@vs-org/session").default;

const vsSession = VsSession({
    url: "mongodb://localhost:27017/vs-rate-limiter",
    collectionName: "login-session",
    secret: "This is session secret",
    cookie: {
      domain: "",
      maxAge: 86400,
      httpOnly: false,
      name: "vs-session",
      path: "/",
      secure: false
    },
    onlyCheckSessionRoutesRoutes: ["/authorize"]
  });

/**
* As here VsSession is used as middlware current route is not present in `onlyCheckSessionRoutesRoutes`.
*/
 app.get("/authorize", vsSession, async (req: Request, resp: Response) => {
    if (req.session) {
      return resp.send("Callback redirect");
    }
    return resp.send("Login page redirect");
  });

/**
* As here VsSession is used as middlware current route is not present in `onlyCheckSessionRoutesRoutes`.
* So package will create session.
*/
app.get("/login", vsSession, async (req: Request, resp: Response) => {
    return resp.send("Login page response");
});


/**
* Create new session and udpate user information.
* Note `/login` page session should be destroyed.
* And new session should be created for logged in user to avoid session fixation attacks.
*/
app.get(
    "/post-login",
    vsSession,
    async (req: Request, resp: Response) => {
      if (req.session) {
        req.session.sessionContext.user = {
          username: "user1-username",
          name: "John Doe"
        };
        await req.session.updateSession();
      }
      return resp.send("Callback redirect");
    }
);

```

<br/>

## Options

| option                                 | required | default                                                                  | Description                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------- | -------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`                                  | `true`   | NA                                                                       | Mongo db connection URL. This package does not accept instance of mongo, it will establish seperate connection                                                                                                                                                                                                                                                                      |
| `username`                             | `false`  | NA                                                                       | Mongo DB `username`                                                                                                                                                                                                                                                                                                                                                                 |
| `password`                             | `false`  | NA                                                                       | Mongo DB `password`                                                                                                                                                                                                                                                                                                                                                                 |
| `loggerLevel`                          | `false`  | NA                                                                       | Logger level for `mongodb` packages. Only `debug` value is accepted.                                                                                                                                                                                                                                                                                                                |
| `collectionName`                       | `false`  | `session_{DB_NAME}`                                                      | Collection name for session store                                                                                                                                                                                                                                                                                                                                                   |
| `secret`                               | `true`   | NA                                                                       | Session secret, this will be used to sign cookies and verify signature. So make sure it will be same and strong as if it is changed all past sessions will be invalid by default                                                                                                                                                                                                    |
| `sessionIdGenerator`                   | `false`  | `@vs-org/random.random({ length: 72, charset: DEFAULTS.randomCharSet })` | This option can be used to generate custom `session id's`. Make sure this function always returns unique strings of length 24 or else there will be unexpected errors or behaviours. Default key is generated with `@vs-org/random` package with custom char set `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`                                                   |
| `expiresInSeconds`                     | `false`  | `30 days = 30 * 24 * 60 * 60`                                            | This will be used for both Mongo store as well as cookie expiry (`Max-Age`). If `cookie.maxAge` and `expiresInSeconds` both options are provided then `expiresInSeconds` takes precedence for session expiry. As ideally session should be destroyed from client side and server side.                                                                                              |
| `onlyCheckSessionRoutes`               | `false`  | NA                                                                       | Use this option if there is need to just check session through middleware. If some routes only needs to check session then add it to `onlyCheckSessionRoutes` array then if session cookies are missing package will not create new session.                                                                                                                                        |
| `onlyCheckSessionRoutesWithHTTPMethod` | `false`  | NA                                                                       | Use this option if there is need to just check session through middleware. If some routes only needs to check session then add it to `onlyCheckSessionRoutes` array but if same route is used with different HTTP methods and needs to check session only for sepecific method then use this option. Eg: `{ "POST": ["/login"], "GET": ["/logout"] }`                               |
| `mongoDbOperationHandlerPackage`       | `true`   | `mongoose`                                                               | This package is dependent on `mongodb` or `mongoose` package to connect and handle mongo db operations. But if application is already using one of these packages then instead of installing peer dependecy there is possibility to use this option to inform `VsSession` package to use either `mongodb` or `mongoose` package. There is no difference between the functionalities |
| `cookie`                               | `true`   | `Default cookie values look at below cookie otions`                      | Cookie options are for session cookies.                                                                                                                                                                                                                                                                                                                                             |
| `cookie.name`                          | `true`   | `vs-sess`                                                                | Session cookie name.                                                                                                                                                                                                                                                                                                                                                                |
| `cookie.domain`                        | `true`   | `""`                                                                     | Session cookie domain.                                                                                                                                                                                                                                                                                                                                                              |
| `cookie.header`                        | `false`  | `"cookie"`                                                               | Custom cookie header. If application is using proxy servers and processing and forwarding cookies in different header (eg: `x-forwared-cookies`). Then this option can be used so that `VsSession` can extract proper cookies from request.                                                                                                                                         |
| `cookie.maxAge`                        | `true`   | `30 days = 30 * 24 * 60 * 60`                                            | Session cookie expiry, if `expiresInSeconds` option present then `expiresInSeconds` will take precedence. And if is not present then this option will be used for session expiry.                                                                                                                                                                                                   |
| `cookie.httpOnly`                      | `true`   | `false`                                                                  | Session cookie httpOnly attribute will determine if JS should have access to session cookie. Recommended way is to set it as always true                                                                                                                                                                                                                                            |
| `cookie.secure`                        | `true`   | `false`                                                                  | Session cookie secure attribute only send cookies with HTTPS and not HTTP                                                                                                                                                                                                                                                                                                           |
| `cookie.sameSite`                      | `false`  | `None`                                                                   | Cookies used for storing sensetive information like authentication / authenticated session should have short lifetime with SameSite as "Strict" or "Lax"                                                                                                                                                                                                                            |

<br/>

## Session object in Express request

| session attribute                | type       | Description                                                                                                                                                                                                                                                    |
| -------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `request.sessionId`              | `string`   | Session id                                                                                                                                                                                                                                                     |
| `request.session.sessionContext` | `object`   | Session context object to keep application required data in session in key value format.                                                                                                                                                                       |
| `request.session.updateSession`  | `Function` | Function to update parameters session. Follow above examples to use it with `express request`. This function can also accept `sessionId` and `sessionContext` as parameters to update, if session id is not from current session then package will throw error |
| `request.session.destroySession` | `Function` | Function to delete current session. Follow above examples to use it with `express request`. This function can also accept `sessionId` as parameters to delete session, if session id is not from current session then package will throw error                 |
| `request.session.getSession`     | `Function` | Function to getSession session. This function can also accept `sessionId` as parameters to get session, if session id is not from current session then package will throw error.                                                                               |

<br/>

## Session helper function signatures

| Name             | Function signature                                                      |
| ---------------- | ----------------------------------------------------------------------- |
| `updateSession`  | `(sessionId?: string,sessionContext?: SessionContext) => Promise<void>` |
| `destroySession` | `(sessionId?: string) => Promise<boolean \| never>`                     |
| `getSession`     | `(sessionId?: string) => Promise<SessionContext>`                       |

## License

MIT (see [LICENSE](https://github.com/vaibhav-sarwade-404/vs-session/blob/main/LICENSE))

<br/>

## Note

This package is not tested with concurrent requests and heavy load (Not production ready). This is experimental package and not actively maintened, only use for development and POC's.
