import { createHash } from "crypto";
import { DataTypes, Model, Op } from "sequelize";

import * as uuid from "uuid";
import * as range_check from "range_check";

import { db } from "./db";
import { User } from "./user";

export type TokenAccess = "readonly" | "publish" | "automation";

export class Token extends Model {
  static hashToken(token: string) {
    return createHash("sha512").update(token).digest("hex");
  }

  static async createTokenForUser(
    userId: string,
    { readonly, cidrWhitelist }: { readonly: boolean; cidrWhitelist?: string[] }
  ): Promise<[string, Token]> {
    const tokenUuid = uuid.v4();
    const hidden = `${tokenUuid.slice(0, 8)}.....${tokenUuid.slice(-4)}`;

    const token = await Token.create({
      token: tokenUuid,
      hidden,
      access: readonly ? ["readonly"] : ["publish"],
      cidrWhitelist,
      userId,
    });

    return [tokenUuid, token];
  }

  // TODO: implement pagination
  static async getTokens(userId: string) {
    const tokens = await Token.findAll({
      where: { userId },
      attributes: {
        include: ["key", "createdAt", "access", "cidrWhitelist"],
      },
      order: [["createdAt", "DESC"]],
    });

    const result = {
      objects: tokens.map((token) => token.getPublicData()),
      urls: {},
    };

    return result;
  }

  /**
   * Revokes a token. Only owner or root user can revoke other
   * users tokens.
   *
   * @param userId
   * @param tokenOrKey
   * @param isRoot
   */
  static async revokeToken(
    userId: string,
    tokenOrKey: string,
    isRoot?: boolean
  ) {
    const hashedToken = Token.hashToken(tokenOrKey);

    const where = {
      [Op.or]: [
        {
          key: tokenOrKey,
        },
        { token: hashedToken },
      ],
    };

    if (!isRoot) {
      (<any>where).userId = userId;
    }

    const numDeleted = await Token.destroy({
      where,
    });

    return numDeleted > 0;
  }

  get cidrWhitelist(): string[] {
    return this.getDataValue("cidrWhitelist") || [];
  }

  checkCIDR(ip: string) {
    // We strip the IPv6 part here for now
    ip = ip.replace("::ffff:", "");
    return this.cidrWhitelist?.length
      ? range_check.inRange(ip, this.cidrWhitelist)
      : true;
  }

  getPublicData() {
    return {
      key: this.getDataValue("key"),
      token: this.getDataValue("hidden"),
      created: this.getDataValue("createdAt"),
      cidr_whitelist: this.cidrWhitelist,
      readonly: (<TokenAccess[]>this.getDataValue("access")).includes(
        "readonly"
      ),
    };
  }
}

Token.init(
  {
    key: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING, // Hash of the token
      set(token: string) {
        if (token) {
          this.setDataValue("token", Token.hashToken(token));
        }
      },
    },
    hidden: DataTypes.STRING,
    cidrWhitelist: {
      type: DataTypes.STRING,
      set(cidrs?: string[]) {
        cidrs && this.setDataValue("cidrWhitelist", cidrs.join(","));
      },
      get() {
        const cidr = this.getDataValue("cidrWhitelist");
        return (cidr && cidr.split(",")) || void 0;
      },
    },

    name: DataTypes.STRING,
    lastUsed: DataTypes.DATE,
    useCount: DataTypes.INTEGER,
    access: {
      type: DataTypes.STRING, // String with comma separated scopes
      get() {
        const access = this.getDataValue("access");
        return (access && access.split(",")) || void 0;
      },
      set(access: string[]) {
        access && this.setDataValue("access", access.join(","));
      },
    },
  },
  {
    sequelize: db,
    modelName: "Token",
  }
);

Token.belongsTo(User, { foreignKey: "userId" });

/*
export class Token {
  ownerId: string;
  key: string;
  name: string;
  token: string; // Encrypted token
  lastUsed: Date;
  createdAt: Date;
}
*/
