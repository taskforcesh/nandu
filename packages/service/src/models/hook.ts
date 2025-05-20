import { createHmac } from "crypto";
import { DataTypes, Model, literal, Sequelize } from "sequelize";
import axios from "axios";
import pino from "pino";

import { User } from "./user";

const logger = pino();

export enum HookEvent {
  PackageStar = "package:star", //	a package was starred	npm star package
  PackageUnstar = "package:unstar", // a pckage was unstarred	npm unstar package
  PackagePublish = "package:publish", // a package was published	npm publish
  PackageUnpublish = "package:unpublish", // a package version was unpublished	npm unpublish @foo/private
  PackageOwner = "package:owner", // added an owner (maintainer)	npm owner add username
  PackageOwnerRm = "package:owner-rm", // removed an owner	npm owner rm username
  PackageDistTag = "package:dist-tag", // dist tag added	npm dist-tag add package@1.0.0 beta
  PackageDistTagRm = "package:dist-tag-rm", // dist tag removed	npm dist-tag rm package beta
  PackageDeprecated = "package:deprecated", // a version was deprecated	npm deprecate package@1.0.0 "dont use this"
  PackageUndeprecated = "package:undeprecated", // a version was undeprecared	npm deprecate package@1.0.0 ""
  PackageChange = "package:change",
}

interface HookChangeObject {
  version?: string; //	the version that was changed	package:publish, package:unpublish
  "dist-tag"?: string; // the tag that was changed	package:dist-tag, package:dist-tag-rm
  user?: string; // the npm username of the starer	package:star, package:unstar
  maintainer?: string; // the npm username of the changed maintainer/owner	package:owner, package:owner-rm
  deprecated?: string; // the version of the package that was deprecated package:deprecated, package:undeprecated
}

interface HookPayload {
  event: HookEvent;
  name: string;
  type: "package" | "owner" | "scope";
  version: string;
  hookOwner?: { username: string };
  payload?: object; // PackageMetadata
  change: HookChangeObject;
  time: number;
}

async function postHook(hook: Hook, payload: HookPayload) {
  const secret = hook.getDataValue("secret");
  const stringPayload = JSON.stringify(payload);

  const signature = createHmac("sha256", secret)
    .update(stringPayload)
    .digest("hex");

  try {
    const response = await axios.post(
      hook.getDataValue("endpoint"),
      {
        json: {
          payload,
        },
        responseType: "json",
      },
      {
        headers: {
          "x-npm-signature": `sha256=${signature}`,
        },
      }
    );
  } catch (err) {
    logger.error({ err, hook }, "Error calling webhook");
  }
}

export class Hook extends Model {
  static getUserHooks(ownerId: string) {
    return Hook.findAll({
      where: { ownerId },
      attributes: [
        "id",
        "type",
        "name",
        "endpoint",
        ["lastTriggeredAt", "last_delivery"],
        "triggerCount",
        "createdAt",
        "updatedAt",
      ],
    });
  }

  // Very simple and slow notification system

  // TODO: Refactor this call so that it can be re-implemented
  // more robostly using a queue system or similar.

  // TODO: A user may have lost rights while the hook was already
  // created, so we could lazily check the rights here and remove
  // thoose hooks...
  static async notifyHooks(
    type: "package" | "owner" | "scope",
    name: string,
    payload: HookPayload
  ) {
    const query = { where: { type, name } };

    // 1) Find all hooks
    const hooks = await Hook.findAll(query);

    // 2) Call the endpoints
    await Promise.all(hooks.map((hook) => postHook(hook, payload)));

    // 3) Update hooks stats
    await Hook.update(
      { triggerCount: literal("triggerCount + 1"), lastTriggerAt: new Date() },
      query
    );
  }
}

export default function (db: Sequelize) {
  Hook.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      type: DataTypes.ENUM("package", "owner", "scope"),
      name: DataTypes.STRING,
      endpoint: DataTypes.STRING,
      secret: {
        type: DataTypes.STRING,
      },
      lastTriggeredAt: DataTypes.DATE,
      triggerCount: DataTypes.INTEGER,
    },
    {
      sequelize: db,
      modelName: "Hook",
    }
  );

  User.hasMany(Hook, { foreignKey: "ownerId" });
}
