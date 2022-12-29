import { DataTypes, Model, Sequelize } from "sequelize";
import { initDb } from "./db";
import { Package } from "./";

export class Registry extends Model {}

export default function (db: Sequelize) {
  Registry.init(
    {
      name: DataTypes.STRING,
      pathName: DataTypes.STRING,
      url: DataTypes.STRING,
    },
    {
      sequelize: db,
    }
  );

  Registry.hasMany(Package);
}
