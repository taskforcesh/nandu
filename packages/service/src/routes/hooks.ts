/**
 *
 */
import { StatusCodes } from "http-status-codes";
import { Request, Response, Router, json } from "express";

import { asyncWrap, canWrite, canAccessOrganization } from "../middleware";
import { Hook } from "../models/hook";
import { OrganizationAction } from "../enums";

export const router = Router();

/**
 * Get hook
 */
router.get(
  "/-/npm/v1/hooks/hook/:hookId",
  asyncWrap(async (req: Request, res: Response) => {
    res
      .status(StatusCodes.OK)
      .json(await Hook.getUserHooks(res.locals.user._id));
  })
);

/**
 * List Hooks
 *
 * package: filter by package name; regexp patterns are not parsed
 * limit: return at most N hooks
 * offset: start at the Nth hook (use with limit for pagination)
 */
router.get(
  "/-/npm/v1/hooks",
  canAccessOrganization(OrganizationAction.manageHooks),
  asyncWrap(async (req: Request, res: Response) => {
    res
      .status(StatusCodes.OK)
      .json({ objects: await Hook.getUserHooks(res.locals.user._id) });
  })
);

/**
 * Add Hook
 */
router.post(
  "/-/npm/v1/hooks/hook",
  canWrite(),
  canAccessOrganization(OrganizationAction.manageHooks),
  json(),
  asyncWrap(async (req: Request, res: Response) => {
    let { type, name, endpoint, secret } = req.body;

    if (type === "scope") {
      name = name.replace(new RegExp("^[@]+"), "");
    }

    const hook = await Hook.create({
      type,
      name,
      endpoint,
      secret,
      ownerId: res.locals.user._id,
    });

    res.status(StatusCodes.CREATED).json(hook);
  })
);

/**
 * Update Hooks
 */
router.put(
  "/-/npm/v1/hooks/hook/:hookId",
  canWrite(),
  canAccessOrganization(OrganizationAction.manageHooks),
  json(),
  asyncWrap(async (req: Request, res: Response) => {
    const { endpoint, secret } = req.body;

    const update = await Hook.update(
      { endpoint, secret },
      {
        where: {
          id: req.params.hookId,
          ownerId: res.locals.user._id,
        },
      }
    );
    res.status(StatusCodes.OK).json({});
  })
);

/**
 * Delete Hooks
 */
router.delete(
  "/-/npm/v1/hooks/hook/:hookId",
  canWrite(),
  canAccessOrganization(OrganizationAction.manageHooks),
  asyncWrap(async (req: Request, res: Response) => {
    const { hookId } = req.params;

    const result = await Hook.destroy({
      where: { id: hookId, ownerId: res.locals.user._id },
    });

    res.status(StatusCodes.OK).json({});
  })
);
