import { DataTypes, Model } from "sequelize";
import { db } from "./db";
import { Package } from "./package";

export class DistTag extends Model {}

DistTag.init(
  {
    key: {
      type: DataTypes.STRING, // `${packageName}-{$tagName}`
      primaryKey: true,
    },
    name: DataTypes.STRING,
    version: DataTypes.STRING,
  },
  {
    sequelize: db,
    modelName: "DistTag",
  }
);
