/**
 *
 */
import { StatusCodes } from "http-status-codes";
import { Request, Response, Router, json } from "express";

import { asyncWrap } from "../middleware/asyncWrap";
import { Team } from "../models/team";
import { UserOrganization } from "../models/organization";
import { User } from "../models/user";

import { isRoot, canWrite, canAccessOrganization } from "../middleware";

export const router = Router();

router.get(
  "/-/org/:scope/user",
  canAccessOrganization(),
  asyncWrap(async (req: Request, res: Response) => {
    const { scope } = req.params;

    const members = await UserOrganization.findAll({
      where: {
        organizationId: scope,
      },
      attributes: ["userId", "role"],
    });

    res.status(StatusCodes.CREATED).json(
      members.reduce((prev, member) => {
        const [_, username] = member.getDataValue("userId").split(":");
        prev[username] = member.getDataValue("role");
        return prev;
      }, {} as any)
    );
  })
);

router.put(
  "/-/org/:scope/user",
  json(),
  canWrite(),
  canAccessOrganization(),
  asyncWrap(async (req: Request, res: Response) => {
    const { scope } = req.params;
    const { user: username, role } = req.body;

    const user = await User.findOne({
      where: {
        name: username,
      },
    });

    if (!user) {
      res.status(StatusCodes.NOT_FOUND).end("User not found");
    }

    await UserOrganization.upsert({
      organizationId: scope,
      userId: user.getDataValue("_id"),
      role,
    });

    res.status(StatusCodes.OK).json({
      org: {
        name: scope,
        size: await UserOrganization.count({
          where: {
            organizationId: scope,
          },
        }),
      },
      user: username,
      role,
    });
  })
);

router.delete(
  "/-/org/:scope/user",
  json(),
  canWrite(),
  canAccessOrganization(),
  asyncWrap(async (req: Request, res: Response) => {
    const { scope } = req.params;
    const { user: username } = req.body;

    const user = await User.findOne({
      where: {
        name: username,
      },
    });

    if (!user) {
      res.status(StatusCodes.NOT_FOUND).end("User not found");
    }

    await UserOrganization.destroy({
      where: {
        organizationId: scope,
        userId: user.getDataValue("_id"),
      },
    });

    res.status(StatusCodes.OK).end();
  })
);

/**
 * Create a new team on a given organization.
 *
 * Note: An organization will created automatically if not existing yet,
 * however, only "root" users have the right to create organizations.
 *
 * Note: Only organization owner or root users are able to add teams
 * to any organization.
 */
router.put(
  "/-/org/:scope/team",
  json(),
  canWrite(),
  canAccessOrganization(),
  isRoot(),
  asyncWrap(async (req: Request, res: Response) => {
    const { scope } = req.params;
    const { name, description } = req.body;
    const { _id: ownerId } = res.locals.user;
    const { isRoot } = res.locals;

    try {
      const team = await Team.createTeam(
        scope,
        name,
        ownerId,
        isRoot,
        description
      );

      res.status(StatusCodes.CREATED).json(team);
    } catch (err) {
      res.status(StatusCodes.FORBIDDEN).send(err);
    }
  })
);

/**
 * Get teams belonging to an Organization
 *
 */
router.get(
  "/-/org/:scope/team",
  canAccessOrganization(),
  asyncWrap(async (req: Request, res: Response) => {
    const { scope } = req.params;

    const teams = await Team.findAll({
      where: {
        organizationId: scope,
      },
    });

    res
      .status(StatusCodes.CREATED)
      .json(teams.map((team) => team.getDataValue("name")));
  })
);

/**
 * List all packages that this organization has access to.
 */
router.get(
  "/-/org/:scope/package",
  canAccessOrganization(),
  asyncWrap(async (req: Request, res: Response) => {
    const { scope } = req.params;

    // We assume all packages at least are part of one team (as developers)
    const packages = await Team.listOrganizationPackages(scope);

    res.status(StatusCodes.OK).json(packages);
  })
);

/**
 * List all packages that this user as organization has access to.
 */
/*
router.get(
  "/-/org/:user/package",
  json(),
  authToken([]),
  asyncWrap(async (req: Request, res: Response) => {
    const { user } = req.params;

    // We could list all the packages the user "owns", as well as all the packages
    // the teams the user is part of have access to.

    res.status(StatusCodes.NOT_ACCEPTABLE).end();
  })
);
*/
