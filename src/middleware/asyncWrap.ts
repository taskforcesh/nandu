import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

/**
 * Properly hadle exceptions from async express handlers.
 */
export const asyncWrap = (
  fn: (req: Request, res: Response) => Promise<void>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res);
    } catch (err) {
      console.error("Error", req.method, req.path, err);
      res.status(StatusCodes.NOT_ACCEPTABLE).end();
    }
  };
};
