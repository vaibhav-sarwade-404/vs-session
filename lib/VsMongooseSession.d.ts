import { IMongoDbSessionStore, VsSessionDocument, VsSessionOptions } from "./types/VsSession.types";
declare class VsMongooseSession implements IMongoDbSessionStore {
    private options;
    private sessionModel;
    private defaultResetInSeconds;
    constructor(options: VsSessionOptions);
    /**
     * connect
     */
    private connect;
    /**
     * getSession
     */
    getSession(sessionId: string): Promise<VsSessionDocument | never>;
    /**
     * createSession
     */
    createSession(session: VsSessionDocument): Promise<VsSessionDocument>;
    /**
     * updateSession
     */
    updateSession(session: VsSessionDocument): Promise<VsSessionDocument>;
    /**
     * destroySession
     */
    destroySession(sessionId: string): Promise<boolean | never>;
}
export default VsMongooseSession;
