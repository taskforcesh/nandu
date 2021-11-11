import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import pino from "pino";

const logger = pino();

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
      logger.error({ method: req.method, path: req.path, err }, "Error");
      res.status(StatusCodes.NOT_ACCEPTABLE).end();
    }
  };
};
