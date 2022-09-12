import mongoose, { ConnectOptions, Schema } from "mongoose";

import {
  IMongoDbSessionStore,
  VsSessionDocument,
  VsSessionOptions
} from "./types/VsSession.types";
import { DEFAULTS } from "./utils/constants";

//"mongodb://localhost:27017/vs-session"
const getDbName = (dbUrl: string) => {
  return dbUrl.split("/").pop();
};

const VsSessionSchema = new Schema({
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

class VsMongooseSession implements IMongoDbSessionStore {
  private options: VsSessionOptions;
  private sessionModel;
  private defaultResetInSeconds: number = 30 * 24 * 60 * 60;

  constructor(options: VsSessionOptions) {
    const {
      collectionName = `session_${getDbName(options.url)}`,
      expiresInSeconds = this.defaultResetInSeconds,
      ...restOptions
    } = options;
    this.options = {
      collectionName,
      expiresInSeconds,
      ...restOptions
    };
    this.sessionModel = mongoose.model(
      collectionName,
      VsSessionSchema,
      collectionName
    );
    this.connect();
  }

  /**
   * connect
   */
  private async connect() {
    const { url, username, password, loggerLevel, collectionName } =
      this.options;
    const connectionOptions: ConnectOptions = {};
    if (username && password) {
      connectionOptions["auth"] = { username, password };
      const dbName = getDbName(url);
      connectionOptions.authSource = dbName || collectionName;
    }
    if (loggerLevel === "debug") {
      mongoose.set("debug", true);
    }
    const client = await mongoose
      .connect(url, {
        ...connectionOptions
      })
      .catch(err => {
        console.error(
          `Something went wrong while connecting to DB with error: ${err}`
        );
        throw new Error(`Unable to connect to DB`);
      });

    if (client) {
      return client;
    } else {
      throw new Error(`Unable to connect to DB`);
    }
  }

  /**
   * getSession
   */
  public async getSession(
    sessionId: string
  ): Promise<VsSessionDocument | never> {
    const session = await this.sessionModel.findOne({ key: sessionId });
    return {
      key: session?.key || "",
      expiry: session?.expiry || new Date(),
      sessionContext: session?.sessionContext || {}
    };
  }

  /**
   * createSession
   */
  public async createSession(
    session: VsSessionDocument
  ): Promise<VsSessionDocument> {
    const sessionId = DEFAULTS.sessionId;
    const { key = sessionId, expiry, sessionContext = {} } = session;
    const _session = await this.sessionModel.findOneAndUpdate(
      {
        key
      },
      {
        $set: {
          expiry,
          sessionContext
        }
      },
      { upsert: true, new: true }
    );
    return {
      key: _session?.key || "",
      expiry: _session?.expiry || new Date(),
      sessionContext: _session?.sessionContext || {}
    };
  }

  /**
   * updateSession
   */
  public async updateSession(
    session: VsSessionDocument
  ): Promise<VsSessionDocument> {
    const _session = await this.sessionModel.findOneAndUpdate(
      {
        key: session.key
      },
      session,
      { new: true }
    );
    return {
      key: _session?.key || "",
      expiry: _session?.expiry || new Date(),
      sessionContext: _session?.sessionContext || {}
    };
  }

  /**
   * destroySession
   */
  public async destroySession(sessionId: string): Promise<boolean | never> {
    const { acknowledged = false, deletedCount = 0 } =
      await this.sessionModel.deleteOne({ key: sessionId });
    return !!acknowledged && !!deletedCount;
  }
}

export default VsMongooseSession;
