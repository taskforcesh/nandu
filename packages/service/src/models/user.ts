import { DataTypes, Model, CreationOptional } from "sequelize";
import * as bcrypt from "bcrypt";
import pino from "pino";
import { sign } from "jsonwebtoken";

import config from "../../config";
import { db } from "./db";

const logger = pino();

export type UserType = "user" | "root";

export class User extends Model {
  static hashPassword(token: string) {
    return bcrypt.hashSync(token, config.saltRounds);
  }

  /**
   * Add the root user if there is no root user.
   */
  static async addRootUser() {
    const transaction = await db.transaction();
    try {
      const userId = `org.couchdb.user:${config.root.user}`;
      const rootUser = await User.findOne({
        where: {
          _id: userId,
        },
        transaction,
      });

      if (!rootUser) {
        logger.info("Root user missing so adding one now");
        await User.create(
          {
            _id: userId,
            name: config.root.user,
            password: config.root.password,
            type: "root",
          },
          { transaction }
        );
      }

      await transaction.commit();
    } catch (err) {
      logger.error(err);
      await transaction.rollback();
      throw err;
    }
  }

  checkPassword(password: string) {
    return bcrypt.compareSync(password, this.getDataValue("password"));
  }

  generateToken() {
    // Create a JWT token.
    return sign(
      { key: this._id, name: this.name, email: this.email },
      config.jwt.secret,
      {
        algorithm: "HS256",
      }
    );
  }

  declare _id: CreationOptional<string>;
  declare type: string;
  declare name: string;
  declare email: string;
  declare password: string;
}

User.init(
  {
    _id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    type: DataTypes.STRING,
    name: {
      type: DataTypes.STRING,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },

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
