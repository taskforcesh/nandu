import { DataTypes, Model, Transaction } from "sequelize";
import { db } from "./db";
import { User } from "./user";

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
  static async ownsOrganization(
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

    if (!membership || membership.getDataValue("role") !== "owner") {
      return false;
    }

    return true;
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
