import { DataTypes, Model } from "sequelize";
import * as bcrypt from "bcrypt";

import config from "../../config";
import { db } from "./db";

export type UserType = "user" | "root";

export class User extends Model {
  static hashPassword(token: string) {
    return bcrypt.hashSync(token, config.saltRounds);
  }

  checkPassword(password: string) {
    return bcrypt.compareSync(password, this.getDataValue("password"));
  }
}

User.init(
  {
    _id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    type: DataTypes.STRING,
    name: DataTypes.STRING,
    email: DataTypes.STRING,

    password: {
      type: DataTypes.STRING, // Hash of the token
      set(password: string) {
        if (password) {
          this.setDataValue("password", User.hashPassword(password));
        }
      },
    },
  },
  {
    sequelize: db,
    modelName: "User",
  }
);
