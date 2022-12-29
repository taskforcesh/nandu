import { DataTypes, Model, Sequelize, Transaction } from "sequelize";
import { initDb, db } from "./db";
import { User } from "./user";
import { OrganizationRole, OrganizationAction } from "../enums";

const roleActions = {
  owner: new Set(Object.values(OrganizationAction)),
  admin: new Set([
    OrganizationAction.createTeam,
    OrganizationAction.listTeams,
    OrganizationAction.listTeamMembers,
    OrganizationAction.deleteTeam,
    OrganizationAction.addMemberToTeam,
    OrganizationAction.removeMemberFromTeam,
    OrganizationAction.manageTeamPackageAccess,
    OrganizationAction.publishPackage,
    OrganizationAction.manageHooks,
  ]),
  developer: new Set([OrganizationAction.publishPackage]),
};

/**
 * Organization's membership
 */
export const UserOrganization = db.define(
  "UserOrganization",
  {
    role: DataTypes.ENUM("owner", "admin", "developer"),
  },
  { timestamps: false }
);

/**
 * Model Organization (aka scope)
 *
 */
export class Organization extends Model {
  static checkPermissions(
    role: OrganizationRole,
    ...actions: OrganizationAction[]
  ) {
    return actions.every((action) => roleActions[role].has(action));
  }

  static async getMemberRole(
    organizationId: string,
    userId: string,
    transaction?: Transaction
  ) {
    const membership = await UserOrganization.findOne({
      where: {
        organizationId,
        userId,
      },
      transaction,
    });

    if (membership) {
      return membership.getDataValue("role") as OrganizationRole;
    }
  }

  static async createOrganization(scope: string, ownerId: string) {
    const transaction = await (await initDb).transaction();

    try {
      let organization = await Organization.findOne({
        where: {
          name: scope,
        },
        transaction,
      });

      if (organization) {
        throw new Error("Organization already exists");
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

      await transaction.commit();

      return organization;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}

export default function (db: Sequelize) {
  Organization.init(
    {
      name: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize: db,
      modelName: "Organization",
    }
  );

  User.belongsToMany(Organization, {
    through: UserOrganization,
    foreignKey: "userId",
  });
  Organization.belongsToMany(User, {
    through: UserOrganization,
    foreignKey: "organizationId",
  });
}
