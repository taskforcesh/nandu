import { DataTypes, Model } from "sequelize";
import { db } from "./db";

export class Author extends Model {}

Author.init(
  {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    url: DataTypes.STRING,
  },
  {
    sequelize: db,
    modelName: "Author",
  }
);
