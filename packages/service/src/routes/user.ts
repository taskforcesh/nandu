/**
 *
 */
import { StatusCodes } from "http-status-codes";
import { Request, Response, Router, json } from "express";

import { User } from "../models/user";
import { db, Organization, UserOrganization } from "../models";
import { asyncWrap, canWrite } from "../middleware";
import { isRoot } from "../utils";

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
  asyncWrap(async (req: Request, res: Response) => {
    // Note: npm-role is Nandu specific (owner, admin or developer)
    const { "npm-scope": scope, "npm-role": role } = req.headers;

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
        User.update(data, {
          where: {
            _id: userId,
          },
        });
      }
      res.status(StatusCodes.OK).json({});
    } else if (isRoot(res.locals.user)) {
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

        if (scope) {
          const org = await Organization.findOne({
            where: { name: scope },
            transaction,
          });

          if (!org) {
            res
              .status(StatusCodes.NOT_FOUND)
              .json({ ok: false, message: "missing organization" });
            throw new Error("Missing organization");
          }

          await UserOrganization.create(
            {
              userId: targetUserId,
              organizationId: scope,
              role: "developer",
            },
            { transaction }
          );
        }

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
 * Get own user data
 */
router.get(
  "/-/npm/v1/user",
  asyncWrap(async (req: Request, res: Response) => {
    const { _id, password, ...user } = res.locals.user;
    res.json(user);
  })
);

/**
 * Get a different user's data
 */
router.get(
  "/-/npm/v1/user/:userId",
  asyncWrap(async (req: Request, res: Response) => {
    if (isRoot(res.locals.user)) {
      const user = await User.findOne({ where: { _id: req.params.userId } });
      if (user) {
        res.json(user);
      } else {
        res.status(StatusCodes.NOT_FOUND).end();
      }
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
