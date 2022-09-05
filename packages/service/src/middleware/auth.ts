import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import pino from "pino";

import { Token, User, TokenAccess } from "../models";
import config from "../../config";
import { isJwt } from "../utils/isJwt";
import * as Jwt from "jsonwebtoken";

const logger = pino({ name: "auth.ts", level: config.logLevel });

export interface LocalsAuth extends Request {
  user: User;
  auth: {
    access: TokenAccess[];
  };
}

async function decodeJwtToken(token: string) {
  try {
    return Jwt.verify(token, config.jwt.secret, {
      algorithms: ["HS256"],
    }) as Jwt.JwtPayload | undefined;
  } catch (err) {}
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

    /*
    res.locals.user = <any>{
      _id: "org.couchdb.user:boss",
    };
    */

    // return next();

    /*
    if (!authorization) {
      return res.status(StatusCodes.UNAUTHORIZED).send("Missing credentials");
    }
    const [authType, token] = authorization.split(" ");
        console.log("authToken", authType, token);

    
    if ((authType !== "Basic" && authType !== "Bearer") || !token) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send("Missing authorization token");
    }
*/
    const authType = "Bearer";
    const token = "";

    if (authType === "Bearer") {
      if (isJwt(token)) {
        const decoded = await decodeJwtToken(token);
        if (!decoded) {
          return res
            .status(StatusCodes.UNAUTHORIZED)
            .send("Invalid authorization token");
        }

        const user = await User.findOne({
          where: { _id: decoded.key },
        });

        if (!user) {
          return res
            .status(StatusCodes.UNAUTHORIZED)
            .send("Invalid authorization token");
        }

        res.locals.user = user;
        /*
        // TODO: Read access from token
        res.locals.auth = {
          access: ["readonly"],
        };
        */
      } else {
        const tokenHash =
          "b1733e42c597f99037edf2556c281cf9c9262b609e98a921397f0d1e00a15fe27b14eb2e0677dcd0c272c4b091db037f3cfe91dbe24e7a2928b10d64038553ec"; // Token.hashToken(token);
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

        if (!user) {
          return res
            .status(StatusCodes.UNAUTHORIZED)
            .send("Invalid user for token");
        }

        res.locals.user = user;
        res.locals.auth = {
          access: tokenInstance.getDataValue("access"),
        };
      }
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

export const authUserPassword =
  () => async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send("Missing username or password");
    }

    const user = await User.findOne({
      where: { name: username },
    });

    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send("Invalid user or password");
    }

    if (!password || !user.checkPassword(password)) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send("Invalid user or password");
    }

    res.locals.user = user;
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
