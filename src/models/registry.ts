import { DataTypes, Model } from "sequelize";
import { db } from "./db";
import { Package } from "./";

export class Registry extends Model {}

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
