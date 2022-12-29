import { DataTypes, Model, Sequelize } from "sequelize";
import { initDb } from "./db";
import { Version } from "./version";

export class Tarball extends Model {}

export default function (db: Sequelize) {
  Tarball.init(
    {
      shasum: DataTypes.STRING,
      tarball: DataTypes.STRING, // "https://registry.npmjs.org/koa-bodyparser/-/koa-bodyparser-0.0.1.tgz"
    },
    {
      sequelize: db,
      modelName: "Tarball",
    }
  );

  Tarball.belongsTo(Version, { foreignKey: "versionId" });
}
