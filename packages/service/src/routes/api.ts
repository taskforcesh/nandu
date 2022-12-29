/**
 * This route provides some special APIs that are required by the Dashboard, but that are not part of the
 * NPM registry API (i.e. not used by the NPM CLI).
 *
 *
 */
import { Router, Request, Response, json } from "express";
import { StatusCodes } from "http-status-codes";
import { randomBytes } from "crypto";

import { Op } from "sequelize";

import config from "../../config";
import {
  asyncWrap,
  authUserPassword,
  canAccessOrganization,
  canWrite,
} from "../middleware";
import {
  DistTag,
  Organization,
  Team,
  User,
  UserOrganization,
  Version,
} from "../models";

import { authToken } from "../middleware";
import { OrganizationAction } from "../enums";
import { sendEmail } from "../services/notifications";

export const router = Router();

router.post("/login", json(), authUserPassword(), async (req, res) => {
  const { user } = res.locals;
  const token = (<User>user).generateToken();
  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      type: user.type,
    },
  });
});

router.post(
  "/passwords/reset",
  json(),
  asyncWrap(async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      res.status(StatusCodes.BAD_REQUEST).send("Email is required");
      return;
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(StatusCodes.NO_CONTENT).end();
    } else {
      user.passwordResetToken = randomBytes(32).toString("hex");
      user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour

      await user.save();

      // Generate link to reset password
      const link = `${config.dashboardUrl}/passwords/reset/${user.passwordResetToken}?email=${user.email}`;
      const html = `
    <html>
      <head>
        <style></style>
      </head>
      <body>
        <p>Hi ${user.name},</p>
        <p>You requested to reset your password.</p>
        <p>Please, click the link below to reset your password</p>
        <a href="${link}">Reset Password</a>
      </body>
    </html>`;

      // Send an email with the password reset token
      await sendEmail(email, "Nandu Reset Password", html);

      res.status(StatusCodes.NO_CONTENT).end();
    }
  })
);

router.post(
  "/passwords/",
  json(),
  asyncWrap(async (req, res) => {
    const { email, token: passwordResetToken, password } = req.body;
    const user = await User.findOne({ where: { passwordResetToken, email } });
    if (user) {
      if (user.passwordResetExpires < new Date()) {
        res.status(StatusCodes.BAD_REQUEST).send("Token expired");
        return;
      }

      await User.update(
        {
          password,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
        {
          where: {
            _id: user._id,
          },
        }
      );

      res.status(StatusCodes.NO_CONTENT).end();
    } else {
      res.status(StatusCodes.BAD_REQUEST).send("Invalid token");
    }
  })
);

router.use(authToken());

/**
 * List all the organizations that the user is a member of.
 */
router.get("/users/:userId/organizations", async (req, res) => {
  const { user } = res.locals;
  const isRoot = user.type === "root";

  if (user._id !== req.params.userId && !isRoot) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .end("You are not allowed to access this resource");
  }

  const organizations = await UserOrganization.findAll({
    where: {
      userId: req.params.userId,
    },
    attributes: ["organizationId", "role"],
  });

  res.status(StatusCodes.OK).json(organizations);
});

/**
 * Create organization for the user.
 * TODO: Restrict this to root users.
 */
router.post("/organizations", canWrite(), json(), async (req, res) => {
  const organization = await Organization.createOrganization(
    req.body.name,
    res.locals.user._id
  );
  res.status(StatusCodes.CREATED).json(organization);
});

/**
 * Get all the users belonging to an organization.
 *
 */
router.get(
  "/organizations/:scope/users",
  canAccessOrganization(OrganizationAction.listMembers),
  asyncWrap(async (req: Request, res: Response) => {
    const { scope } = req.params;

    const organization = await Organization.findOne({
      where: {
        name: scope,
      },
      include: {
        model: User,
        attributes: ["_id", "name", "email", "type"],
      },
    });

    const members: any[] = (<any>organization).Users.map((user: any) => {
      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
        role: user.UserOrganization.role,
      };
    });

    res.status(StatusCodes.OK).json(members);
  })
);

/**
 * Get all the users belonging to an organization.
 *
 */
router.get(
  "/organizations/:scope/teams",
  canAccessOrganization(OrganizationAction.listMembers),
  asyncWrap(async (req: Request, res: Response) => {
    const { scope } = req.params;

    const teams = await Team.findAll({
      where: {
        organizationId: scope,
      },
    });

    res.status(StatusCodes.OK).json(teams);
  })
);

/**
 * Get users belonging to a given team
 */
router.get(
  "/organizations/:scope/:teamName/users",
  canAccessOrganization(OrganizationAction.listTeamMembers),
  asyncWrap(async (req: Request, res: Response) => {
    const { scope, teamName } = req.params;

    const team = (await Team.getMembers(scope, teamName)) as Team & {
      members: any[];
    };

    res.status(StatusCodes.OK).json(team.members);
  })
);

/**
 * List all packages that this organization has access to.
 */
router.get(
  "/organizations/:scope/packages",
  canAccessOrganization(OrganizationAction.manageTeamPackageAccess),
  asyncWrap(async (req: Request, res: Response) => {
    const { scope } = req.params;

    const distTags = await DistTag.findAll({
      where: {
        packageId: { [Op.startsWith]: `@${scope}/` },
        name: "latest",
      },
    });

    const versions = await Version.findAll({
      where: {
        _id: {
          [Op.in]: distTags.map(
            (tag) =>
              `${tag.getDataValue("packageId")}@${tag.getDataValue("version")}`
          ),
        },
      },
    });

    res.status(StatusCodes.OK).json(versions);
  })
);
