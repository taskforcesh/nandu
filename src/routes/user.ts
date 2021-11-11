/**
 *
 */
import { StatusCodes } from "http-status-codes";
import { Request, Response, Router, json } from "express";

import { User } from "../models/user";
import { db } from "../models";
import { asyncWrap, canWrite, isRoot } from "../middleware";

export const router = Router();

/*
{
    "ok": false,
    "message": "Unknown error while authenticating"
}
*/

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
    // Currently we do not use the scope, left here for reference.
    const { "npm-scope": scope } = req.headers;

    const { name, password, email, type } = req.body;
    const { user } = res.locals;

    const { _id: userId } = res.locals.user;
    const targetUserId = req.params.userId;

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
      const transaction = await db.transaction();
      try {
        const user = await User.findOne({
          where: { _id: targetUserId },
          transaction,
        });
        if (user) {
          res
            .status(StatusCodes.CONFLICT)
            .json({ ok: false, message: "cannot create existing user" });
          throw new Error("Cannot create existing user");
        }

        await User.create({ _id: targetUserId, ...data }, { transaction });

        await transaction.commit();
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
      res.status(StatusCodes.CREATED).json({});
    } else {
      res.status(StatusCodes.FORBIDDEN).json({
        error: "Missing rights",
      });
    }
  })
);

/**
 * Change password
 */
router.post(
  "/-/npm/v1/user",
  json(),
  canWrite(),
  asyncWrap(async (req: Request, res: Response) => {
    const { password } = req.body as { password: { old: string; new: string } };
    const user = res.locals.user as User;

    if (user.checkPassword(password.old)) {
      await User.update(
        {
          password: password.new,
        },
        {
          where: { _id: user.getDataValue("_id") },
        }
      );
      res.status(StatusCodes.OK).json({});
    } else {
      res.status(StatusCodes.NOT_ACCEPTABLE).end();
    }
  })
);

/**
 * Get public user data
 */
router.get(
  "/-/npm/v1/user",
  asyncWrap(async (req: Request, res: Response) => {
    const { _id, password, ...user } = res.locals.user;
    res.json(user);
  })
);

/**
 * List all packages that this user has access to.
 */
router.get(
  "/-/user/:user/package",
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
