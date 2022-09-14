import express, { Request, Response } from "express";

import VsSession from "./src";

(async () => {
  const app = express();

  const vsSession = VsSession({
    url: "mongodb://localhost:27017/vs-session",
    collectionName: "login-session",
    secret: "This is session secret",

    cookie: {
      domain: "",
      httpOnly: false,
      name: "vs-session",
      path: "/",
      secure: true,
      sameSite: "None",
      maxAge: 3 * 24 * 60 * 60
    },
    onlyCheckSessionRoutes: ["/logout"],
    onlyCheckSessionRoutesWithHTTPMethod: {
      GET: ["/update-session"]
    },
    mongoDbOperationHandlerPackage: "mongoose"
  });
  app.get("/login", vsSession, async (req: Request, resp: Response) => {
    return resp.send("Login success response");
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

  app.get("/logout", vsSession, async (req: Request, resp: Response) => {
    if (req.session) {
      await req.session.destroySession();
    }
    return resp.send("Logout session success response");
  });

  app.listen(3000, () => console.log(`App is listening on port 3000`));
})();
