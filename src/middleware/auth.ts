import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

import { Token, User, TokenAccess } from "../models";
import config from "../../config";

import pino from "pino";

const logger = pino({ name: "auth.ts", level: config.logLevel });

export interface LocalsAuth extends Request {
  user: User;
  auth: {
    access: TokenAccess[];
  };
}

/**
 * Middleware to authenticate user based on Basic or Bearer token.
 *
 */
export const authToken =
  () =>
  async (req: Request, res: Response<any, LocalsAuth>, next: NextFunction) => {
    const { authorization } = req.headers;

    logger.debug({ headers: req.headers, body: req.body });

    if (!authorization) {
      return res.status(StatusCodes.UNAUTHORIZED).send("Missing credentials");
    }
    const [authType, token] = authorization.split(" ");
    if ((authType !== "Basic" && authType !== "Bearer") || !token) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send("Missing authorization token");
    }

    if (authType === "Bearer") {
      const tokenHash = Token.hashToken(token);
      const tokenInstance = await Token.findOne({
        where: { token: tokenHash },
      });

      if (!tokenInstance) {
        return res.status(StatusCodes.UNAUTHORIZED).send("Invalid token");
      }

      if (!tokenInstance.checkCIDR(req.ip)) {
        return res.status(StatusCodes.UNAUTHORIZED).send("Invalid IP");
      }

      const user = await User.findOne({
        where: { _id: tokenInstance.getDataValue("userId") },
      });

      res.locals.user = user;
      res.locals.auth = {
        access: tokenInstance.getDataValue("access"),
      };
    } else if (authType === "Basic") {
      const [username, password] = Buffer.from(token, "base64")
        .toString()
        .split(":");

      const user = await User.findOne({
        where: { name: username },
      });

      if (!user || !user.checkPassword(password)) {
        logger.info({ user }, "did not match password");
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .send("Invalid user or password");
      }

      res.locals.user = user;
    }
    next();
  };

export const authPassword =
  () => async (req: Request, res: Response, next: NextFunction) => {
    const { password } = req.body;

    const user = res.locals.user as User;

    if (!password || !user.checkPassword(password)) {
      return res.status(StatusCodes.UNAUTHORIZED).send("Invalid password");
    }

    next();
  };

export const canWrite =
  () =>
  async (req: Request, res: Response<any, LocalsAuth>, next: NextFunction) => {
    if (res.locals.auth?.access?.includes("readonly")) {
      return res.status(StatusCodes.FORBIDDEN).send("Requires write access");
    }
    next();
  };
