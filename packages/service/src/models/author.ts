import { DataTypes, Model, Sequelize } from "sequelize";

export class Author extends Model {}

export default function (db: Sequelize) {
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

  return Author;
}
