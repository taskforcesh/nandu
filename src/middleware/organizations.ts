import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

import { Organization } from "../models/organization";
import config from "../../config";

export const canAccessOrganization =
  () => async (req: Request, res: Response, next: NextFunction) => {
    const { _id: ownerId } = res.locals.user;
    const { isRoot } = res.locals;

    if (isRoot) {
      return next();
    }

    const canAccess = await Organization.ownsOrganization(
      req.params.scope,
      ownerId,
    );

    if (!canAccess) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .send("Requires organization access");
    }
    next();
  };
