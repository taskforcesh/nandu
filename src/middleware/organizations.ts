import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

import { OrganizationAction } from "../enums";
import { Organization } from "../models/organization";
import { isRoot } from "../utils";

export const canAccessOrganization =
  (...actions: OrganizationAction[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { _id: ownerId } = res.locals.user;

    if (isRoot(res)) {
      return next();
    }

    const role = await Organization.getMemberRole(req.params.scope, ownerId);

    if (role) {
      if (Organization.checkPermissions(role, ...actions)) {
        return next();
      } else {
        return res
          .status(StatusCodes.FORBIDDEN)
          .send("Member's role has not right to perform the action");
      }
    } else {
      return res
        .status(StatusCodes.FORBIDDEN)
        .send("Requires organization access");
    }
  };
