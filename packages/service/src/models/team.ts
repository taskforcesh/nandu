import { DataTypes, Model, Op } from "sequelize";
import { db } from "./db";
import { User } from "./user";
import { Organization, UserOrganization } from "./organization";
import { Package } from "./package";
import { Permissions } from "../types";

const UserTeam = db.define("UserTeam", {}, { timestamps: false });

const TeamPackage = db.define(
  "TeamPackage",
  {
    permissions: {
      type: DataTypes.ENUM("read-only", "read-write"),
    },
  },
  { timestamps: false }
);

export class Team extends Model {
  static async createTeam(
    scope: string,
    name: string,
    ownerId: string,
    isRoot: boolean,
    description?: string
  ) {
    const transaction = await db.transaction();

    try {
      let organization = await Organization.findOne({
        where: {
          name: scope,
        },
        transaction,
      });

      if (!organization) {
        if (!isRoot) {
          throw new Error("Only roots can create organizations");
        }
        organization = await Organization.create(
          {
            name: scope,
          },
          { transaction }
        );

        // Add owner as member of the organization
        await UserOrganization.create(
          {
            organizationId: scope,
            userId: ownerId,
            role: "owner",
          },
          { transaction }
        );
      }

      const team = await Team.create(
        {
          id: `${scope}:${name}`,
          name,
          description,
          organizationId: scope,
        },
        {
          transaction,
        }
      );

      await transaction.commit();

      return team;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  static async removeTeam(scope: string, team: string) {
    await Team.destroy({
      where: {
        id: `${scope}:${team}`,
      },
    });
  }

  static async getMembers(scope: string, teamName: string) {
    const teamId = `${scope}:${teamName}`;

    return Team.findOne({
      where: { id: teamId },
      include: { model: User, as: "members" },
      order: [[{ model: User, as: "members" }, "updatedAt", "DESC"]],
    });
  }

  static async addMember(scope: string, teamName: string, userName: string) {
    const transaction = await db.transaction();

    try {
      const user = await User.findOne({
        where: { name: userName },
        attributes: ["name", "email", "type", "_id"],
        transaction,
      });

      if (!user) {
        throw new Error("Missing user");
      }

      const teamId = `${scope}:${teamName}`;
      const team = await Team.findOne({ where: { id: teamId }, transaction });

      if (!team) {
        throw new Error("Missing team");
      }

      await UserTeam.create(
        {
          teamId,
          userId: user.getDataValue("_id"),
        },
        { transaction }
      );

      await transaction.commit();

      return {
        name: user.getDataValue("name"),
        email: user.getDataValue("email"),
        type: user.getDataValue("type"),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  static async removeUser(scope: string, teamName: string, userName: string) {
    const user = await User.findOne({ where: { name: userName } });

    if (!user) {
      throw new Error("Missing user");
    }

    const teamId = `${scope}:${teamName}`;

    return UserTeam.destroy({
      where: {
        teamId,
        userId: user.getDataValue("_id"),
      },
    });
  }

  static async grantAccess(
    scope: string,
    teamName: string,
    packageId: string,
    permissions: Permissions
  ) {
    const transaction = await db.transaction();

    try {
      const teamId = `${scope}:${teamName}`;
      const team = await Team.findOne({ where: { id: teamId }, transaction });
      if (!team) {
        throw new Error("Missing team");
      }

      const pkg = await Package.findOne({
        where: { _id: packageId },
        transaction,
      });
      if (!pkg) {
        throw new Error("Missing package");
      }

      await TeamPackage.create(
        {
          teamId,
          packageId,
          permissions,

          // Denormalize organization for faster queries
          organizationId: team.getDataValue("organizationId"),
        },
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  static async revokeAccess(
    scope: string,
    teamName: string,
    packageId: string
  ) {
    const teamId = `${scope}:${teamName}`;

    await TeamPackage.destroy({
      where: {
        teamId,
        packageId,
      },
    });
  }

  static async listPackages(scope: string, teamName: string) {
    const teamId = `${scope}:${teamName}`;

    return TeamPackage.findAll({
      where: {
        teamId,
      },
    });
  }

  static async listOrganizationPackages(scope: string) {
    return TeamPackage.findAll({
      where: {
        organizationId: scope,
      },
      attributes: ["packageId", "permissions", ["teamId", "team"]],
    });
  }

  static async checkPermissions(
    userId: string,
    packageId: string,
    permissions: Permissions[]
  ) {
    // Check which teams have permissions for this package
    // and where given user is member of said teams.
    const teams = await Team.findAll({
      include: [
        { model: User, as: "members", where: { _id: userId }, attributes: [] },
        {
          model: Package,
          as: "packages",
          where: { _id: packageId },
          through: {
            attributes: ["permissions"],
            where: {
              permissions: {
                [Op.or]: permissions,
              },
            },
          },
          attributes: ["_id"],
        },
      ],
      attributes: [],
    });

    return teams.length > 0;
  }
}

Team.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    description: DataTypes.STRING,
  },
  {
    sequelize: db,
    modelName: "Team",
  }
);

Team.belongsTo(Organization, { foreignKey: "organizationId" });

// Team membership
User.belongsToMany(Team, {
  through: UserTeam,
  foreignKey: "userId",
  as: "members",
});
Team.belongsToMany(User, {
  through: UserTeam,
  foreignKey: "teamId",
  as: "members",
});

// Package permissions
TeamPackage.belongsTo(Organization, { foreignKey: "organizationId" });

Package.belongsToMany(Team, {
  through: TeamPackage,
  foreignKey: "packageId",
  as: "packages",
});
Team.belongsToMany(Package, {
  through: TeamPackage,
  foreignKey: "teamId",
  as: "packages",
});
