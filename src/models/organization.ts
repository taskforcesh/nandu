import { DataTypes, Model, Transaction } from "sequelize";
import { db } from "./db";
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
}

Organization.init(
  {
    name: {
      type: DataTypes.STRING,
      primaryKey: true,
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
