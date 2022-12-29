import { DataTypes, Model, Sequelize } from "sequelize";

export class DistTag extends Model {}

export default function (db: Sequelize) {
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
}
