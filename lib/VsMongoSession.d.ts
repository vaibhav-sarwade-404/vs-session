import { VsSessionDocument, VsSessionOptions, IMongoDbSessionStore } from "./types/VsSession.types";
declare class VsMongoSession implements IMongoDbSessionStore {
    private options;
    private isConnected;
    private client;
    private sessionCollection;
    private expiryIndexName;
    private defaultResetInSeconds;
    private static instance;
    private constructor();
    static getInstance(options: VsSessionOptions): VsMongoSession;
    /**
     * connect
     */
    private connect;
    /**
     * createIndex
     */
    private createIndex;
    /**
     * createCollection
     */
    private createCollection;
    /**
     * getCollection
     */
    private getCollection;
    /**
     * getSession
     */
    getSession(sessionId: string): Promise<VsSessionDocument | undefined | never>;
    /**
     * createSession
     */
    createSession(session: VsSessionDocument): Promise<VsSessionDocument | undefined | never>;
    /**
     * updateSession
     */
    updateSession(session: VsSessionDocument): Promise<VsSessionDocument | undefined | never>;
    /**
     * destroySession
     */
    destroySession(sessionId: string): Promise<boolean | undefined | never>;
}
export default VsMongoSession;
