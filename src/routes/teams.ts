/**
 *
 */
import { StatusCodes } from "http-status-codes";
import { Request, Response, Router, json } from "express";

import { asyncWrap, canWrite, canAccessOrganization } from "../middleware";
import { Team } from "../models/team";

export const router = Router();

/**
 * Remove a team from organization
 */
router.delete(
  "/-/team/:scope/:team",
  canWrite(),
  canAccessOrganization(),
  asyncWrap(async (req: Request, res: Response) => {
    const { scope, team } = req.params;

    await Team.removeTeam(scope, team);

    res.status(StatusCodes.OK).json({});
  })
);

/**
 * Get users belonging to a given team
 */
router.get(
  "/-/team/:scope/:teamName/user",
  canAccessOrganization(),
  asyncWrap(async (req: Request, res: Response) => {
    const { scope, teamName } = req.params;

    const team = await Team.getMembers(scope, teamName);

    res
      .status(StatusCodes.OK)
      .json(
        team.getDataValue("members").map((user: { name: string }) => user.name)
      );
  })
);

/**
 * Add a user to a given team in a given organization.
 */
router.put(
  "/-/team/:scope/:team/user",
  json(),
  canWrite(),
  canAccessOrganization(),
  asyncWrap(async (req: Request, res: Response) => {
    const { scope, team } = req.params;
    const { user: userName } = req.body;

    await Team.addUser(scope, team, userName);

    res.status(StatusCodes.OK).json({});
  })
);

/**
 * Remove a user from  a given team
 */
router.delete(
  "/-/team/:scope/:team/user",
  json(),
  canWrite(),
  canAccessOrganization(),
  asyncWrap(async (req: Request, res: Response) => {
    const { scope, team } = req.params;
    const { user: userName } = req.body;

    await Team.removeUser(scope, team, userName);

    res.status(StatusCodes.OK).json({});
  })
);

/**
 * List package access for a given team in a given organization
 */
router.get(
  "/-/team/:scope/:team/package",
  canAccessOrganization(),
  asyncWrap(async (req: Request, res: Response) => {
    const { scope, team } = req.params;

    const packages = await Team.listPackages(scope, team);

    res.status(StatusCodes.OK).json(packages);
  })
);

/**
 * Grant access to team
 */
router.put(
  "/-/team/:scope/:team/package",
  json(),
  canWrite(),
  canAccessOrganization(),
  asyncWrap(async (req: Request, res: Response) => {
    const { scope, team } = req.params;
    const { package: pkg, permissions } = req.body;

    await Team.grantAccess(scope, team, pkg, permissions);

    res.status(StatusCodes.OK).json({});
  })
);

/**
 * Revoke access from team
 */
router.delete(
  "/-/team/:scope/:team/package",
  json(),
  canWrite(),
  canAccessOrganization(),
  asyncWrap(async (req: Request, res: Response) => {
    const { scope, team } = req.params;
    const { package: pkg } = req.body;

    await Team.revokeAccess(scope, team, pkg);

    res.status(StatusCodes.OK).json({});
  })
);
