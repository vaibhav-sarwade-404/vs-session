import { Collection, MongoClient, MongoClientOptions } from "mongodb";

import {
  VsSessionDocument,
  VsSessionOptions,
  IMongoDbSessionStore
} from "./types/VsSession.types";
import { DEFAULTS } from "./utils/constants";

//"mongodb://localhost:27017/vs-rate-limiter"
const getDbName = (dbUrl: string) => {
  return dbUrl.split("/").pop();
};

class VsMongoSession implements IMongoDbSessionStore {
  private options: VsSessionOptions;
  private isConnected: boolean = false;
  private client!: MongoClient;
  private sessionCollection!: Collection;
  private expiryIndexName: string = `expiry`;
  private defaultResetInSeconds: number = 30 * 24 * 60 * 60;
  private static instance: VsMongoSession;

  private constructor(options: VsSessionOptions) {
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
  }

  public static getInstance(options: VsSessionOptions): VsMongoSession {
    if (!VsMongoSession.instance) {
      VsMongoSession.instance = new VsMongoSession(options);
    }
    return VsMongoSession.instance;
  }

  /**
   * connect
   */
  private async connect() {
    const { url, username, password, loggerLevel, collectionName } =
      this.options;
    const connectionOptions: MongoClientOptions = {};
    if (username && password) {
      connectionOptions["auth"] = { username, password };
      const dbName = getDbName(url);
      connectionOptions.authSource = dbName || collectionName;
    }
    if (loggerLevel) {
      connectionOptions.loggerLevel = loggerLevel;
    }
    const client = await MongoClient.connect(url, {
      ...connectionOptions,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 10000
    }).catch(err => {
      console.error(
        `Something went wrong while connecting to DB with error: ${err}`
      );
      throw new Error(`Unable to connect to DB`);
    });

    if (client) {
      this.isConnected = true;
      this.client = client;
      return client;
    } else {
      throw new Error(`Unable to connect to DB`);
    }
  }

  /**
   * createIndex
   */
  private createIndex = async (collection: Collection) => {
    collection.createIndex(
      { [this.expiryIndexName]: 1 },
      { expireAfterSeconds: 0 }
    );
  };

  /**
   * createCollection
   */
  private async createCollection() {
    if (this.client) {
      const collection: Collection = await this.client
        .db(getDbName(this.options.url))
        .createCollection(this.options.collectionName || "");
      await this.createIndex(collection);
      this.sessionCollection = collection;
    }
  }

  /**
   * getCollection
   */
  private async getCollection(): Promise<Collection | null | undefined> {
    if (!this.isConnected) {
      await this.connect();
    }
    if (this.sessionCollection) {
      return this.sessionCollection;
    } else if (this.client) {
      const collections = await this.client
        .db()
        .collections({ nameOnly: true });
      if (collections.length) {
        const collection = collections.find(
          (collection: Collection) =>
            collection.collectionName === this.options.collectionName
        );
        if (collection) {
          const indexExist = await collection.indexExists(this.expiryIndexName);
          if (!indexExist) {
            await this.createIndex(collection);
          }
          this.sessionCollection = collection;
          return collection;
        } else {
          await this.createCollection();
          return this.sessionCollection;
        }
      } else {
        await this.createCollection();
        return this.sessionCollection;
      }
    }
    return null;
  }

  /**
   * getSession
   */
  public async getSession(
    sessionId: string
  ): Promise<VsSessionDocument | undefined | never> {
    const sessionCollection = await this.getCollection();
    const defaultSession = DEFAULTS.sessionDocument();
    if (sessionCollection) {
      const _session = await this.sessionCollection.findOne({ key: sessionId });
      if (_session) {
        const { key, expiry, sessionContext } = _session || defaultSession;
        return {
          key,
          expiry,
          sessionContext
        };
      }
    }
  }

  /**
   * createSession
   */
  async createSession(
    session: VsSessionDocument
  ): Promise<VsSessionDocument | undefined | never> {
    const sessionCollection = await this.getCollection();
    const defaultSession = DEFAULTS.sessionDocument();
    if (sessionCollection) {
      const sessionId = DEFAULTS.sessionId();
      const { key = sessionId, expiry, sessionContext = {} } = session;
      const _session = await sessionCollection.findOneAndUpdate(
        {
          key
        },
        {
          $set: {
            expiry,
            sessionContext
          }
        },
        { upsert: true, returnDocument: "after" }
      );
      if (_session && _session.ok) {
        const { key, expiry, sessionContext } =
          _session?.value || defaultSession;
        return {
          key,
          expiry,
          sessionContext
        };
      }
    }
  }

  /**
   * updateSession
   */
  public async updateSession(
    session: VsSessionDocument
  ): Promise<VsSessionDocument | undefined | never> {
    const sessionCollection = await this.getCollection();
    const defaultSession = DEFAULTS.sessionDocument();
    if (sessionCollection) {
      const { key = session.key, expiry, sessionContext = {} } = session;
      const _session = await sessionCollection.findOneAndUpdate(
        {
          key
        },
        {
          $set: { expiry, sessionContext }
        },
        { returnDocument: "after" }
      );
      if (_session.ok) {
        const { key, expiry, sessionContext } =
          _session?.value || defaultSession;
        return {
          key,
          expiry,
          sessionContext
        };
      }
    }
  }

  /**
   * destroySession
   */
  public async destroySession(
    sessionId: string
  ): Promise<boolean | undefined | never> {
    const sessionCollection = await this.getCollection();
    if (sessionCollection) {
      const { acknowledged = false, deletedCount = 0 } =
        await this.sessionCollection.deleteOne({ key: sessionId });
      return acknowledged && !!deletedCount;
    }
  }
}

export default VsMongoSession;
