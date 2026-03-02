import { DataTypes, Model, Sequelize } from "sequelize";
import { initDb } from "./db";

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

    // Build the time field for pnpm minimumReleaseAge support
    const time: { [key: string]: string } = {};
    
    // Find the earliest and latest version timestamps
    let earliest: Date | null = null;
    let latest: Date | null = null;
    
    // Note: pkg.versions contains VersionModel instances from Sequelize include,
    // not plain Version interface objects, so we use any for runtime properties
    pkg.versions.forEach((version: any) => {
      const createdAt = version.createdAt;
      if (createdAt) {
        const timestamp = createdAt instanceof Date ? createdAt : new Date(createdAt);
        time[version.version] = timestamp.toISOString();
        
        if (!earliest || timestamp < earliest) {
          earliest = timestamp;
        }
        if (!latest || timestamp > latest) {
          latest = timestamp;
        }
      }
    });
    
    // Add package-level timestamps
    const pkgCreatedAt = pkg.getDataValue("createdAt");
    const pkgUpdatedAt = pkg.getDataValue("updatedAt");
    
    // Use the earliest version timestamp or package creation time
    if (earliest) {
      time.created = earliest.toISOString();
    } else if (pkgCreatedAt) {
      const pkgCreated = pkgCreatedAt instanceof Date ? pkgCreatedAt : new Date(pkgCreatedAt);
      time.created = pkgCreated.toISOString();
    }
    
    // Use the latest version timestamp or package update time
    if (latest) {
      time.modified = latest.toISOString();
    } else if (pkgUpdatedAt) {
      const pkgUpdated = pkgUpdatedAt instanceof Date ? pkgUpdatedAt : new Date(pkgUpdatedAt);
      time.modified = pkgUpdated.toISOString();
    }

    return {
      ...pkg.toJSON(),
      versions,
      "dist-tags": distTags,
      time,
    };
  }

  static async addPackage(
    packageId: string,
    userId: string,
    name: string,
    access: "public" | "restricted"
  ) {
    const transaction = await (await initDb).transaction();

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

export default function (db: Sequelize) {
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
      timestamps: true,
    }
  );

  Package.hasMany(DistTag, { foreignKey: "packageId", as: "dist-tags" });
  Package.hasMany(VersionModel, { foreignKey: "packageId", as: "versions" });
  Package.belongsTo(User, { foreignKey: "userId" });
}
