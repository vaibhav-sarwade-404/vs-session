import { Request, Response, NextFunction } from "express";
import { VsSessionOptions } from "./types/VsSession.types";
declare const VsSession: (options: VsSessionOptions) => (req: Request, resp: Response, next: NextFunction) => Promise<void>;
export default VsSession;
