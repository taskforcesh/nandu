/**
 *
 */
import { StatusCodes } from "http-status-codes";
import { Request, Response, Router, json } from "express";

import { User } from "../models/user";
import { asyncWrap, canWrite, isRoot } from "../middleware";

export const router = Router();

/*
{
    "ok": false,
    "message": "Unknown error while authenticating"
}
*/

/**
 * Login?
 */
router.post(
  "/-/v1/login",
  json(),
  canWrite(),
  asyncWrap(async (req: Request, res: Response) => {
    // Unsure what we are supposed to do in this endpoint

    res.status(StatusCodes.UNAUTHORIZED).json({
      error: "You must be logged in to publish packages.",
    });
  })
);

/**
 * Update or add a new User
 *
 */
router.put(
  "/-/user/:userId",
  json(),
  canWrite(),
  isRoot(),
  asyncWrap(async (req: Request, res: Response) => {
    // Currently we do not use the scope, left for reference
    const { "npm-scope": scope } = req.headers;

    const { name, password, email, type } = req.body;
    const { user } = res.locals;

    const { userId } = res.locals.user;
    const targetUserId = req.params.userId || userId;

    const data = {
      name,
      email,
      password,
      type,
    };

    if (userId === targetUserId) {
      if (!user.checkPassword(password)) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          error: "Invalid password",
        });
      } else {
        User.update(
          {
            name,
            email,
            password,
            type,
          },
          {
            where: {
              _id: userId,
            },
          }
        );
      }
      res.status(StatusCodes.OK).json({});
    } else if (res.locals.isRoot) {
      const user = await User.create({ _id: targetUserId, ...data });
      res.status(StatusCodes.CREATED).json({});
    } else {
      res.status(StatusCodes.FORBIDDEN).json({
        error: "Missing rights",
      });
    }
  })
);

/**
 * List all packages that this user has access to.
 */
router.get(
  "/-/user/:user/package",
  json(),
  asyncWrap(async (req: Request, res: Response) => {
    const { user } = req.params;

    // TODO: Implement
    // We could list all the packages the user "owns", as well as all the packages
    // the teams the user is part of have access to?

    res.status(StatusCodes.NOT_ACCEPTABLE).end();
  })
);

router.get(
  "/-/whoami",
  asyncWrap(async (req: Request, res: Response) => {
    res.json({ username: res.locals.user.name });
  })
);
