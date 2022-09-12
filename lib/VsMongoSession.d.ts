import { VsSessionDocument, VsSessionOptions, IMongoDbSessionStore } from "./types/VsSession.types";
declare class VsMongoSession implements IMongoDbSessionStore {
    private options;
    private isConnected;
    private client;
    private sessionCollection;
    private expiryIndexName;
    private defaultResetInSeconds;
    constructor(options: VsSessionOptions);
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
