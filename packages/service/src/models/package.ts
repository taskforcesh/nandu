import { DataTypes, Model } from "sequelize";
import { db } from "./db";

import { Version as VersionModel } from "./version";
import { DistTag } from "./dist-tag";
import { Version } from "../interfaces/";
import { User } from "./user";

export class Package extends Model {
  static async getPackage(packageId: string) {
    const pkg = await Package.findOne({
      where: { _id: packageId },
      include: [
        { model: VersionModel, as: "versions" },
        { model: DistTag, as: "dist-tags" },
      ],
    });

    if (!pkg) {
      return;
    }

    const versions = pkg.versions.reduce((prev, version) => {
      prev[version.version] = version;
      return prev;
    }, {} as { [index: string]: Version });

    const distTags = pkg
      .getDataValue("dist-tags")
      .reduce((prev: any, tag: any) => {
        prev[tag.name] = tag.version;
        return prev;
      }, {});

    return {
      ...pkg.toJSON(),
      versions,
      "dist-tags": distTags,
    };
  }

  static async addPackage(
    packageId: string,
    userId: string,
    name: string,
    access: "public" | "restricted"
  ) {
    const transaction = await db.transaction();

    try {
      let pkg = await Package.findOne({
        where: {
          _id: packageId,
        },
        transaction,
      });

      if (!pkg) {
        pkg = await Package.create(
          {
            _id: packageId,
            userId,
            name,
            access,
          },
          { transaction }
        );
      }

      await transaction.commit();

      return pkg;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  get versions(): Version[] {
    return this.getDataValue("versions");
  }

  set versions(versions: Version[]) {
    this.setDataValue("versions", versions);
  }
}

Package.init(
  {
    _id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    access: DataTypes.ENUM("public", "restricted"),
  },
  {
    sequelize: db,
    modelName: "Package",
  }
);

Package.hasMany(DistTag, { foreignKey: "packageId", as: "dist-tags" });
Package.hasMany(VersionModel, { foreignKey: "packageId", as: "versions" });
Package.belongsTo(User, { foreignKey: "userId" });
