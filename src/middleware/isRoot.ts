import { Request, Response, NextFunction } from "express";
import config from "../../config";

export const isRoot =
  () => (req: Request, res: Response, next: NextFunction) => {
    res.locals.isRoot = res.locals.user?.name === config.rootUser;
    next();
  };
