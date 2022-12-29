import { Sequelize } from "sequelize";
import { Umzug, SequelizeStorage } from "umzug";

import pino from "pino";

import config from "../../config";
import { migrations } from "./migrations";

const logger = pino({ name: "Sequelize", level: config.logLevel });

export const db = new Sequelize(config.sequelize.uri, {
  logging: (msg) => logger.debug(msg),
});

import initUser, { User } from "./user";

import initAuthor from "./author";
import initDistTag from "./dist-tag";
import initHook from "./hook";
import initOrganization from "./organization";
import initPackage from "./package";
import initRegistry from "./registry";
import initTarball from "./tarball";
import initTeam from "./team";
import initToken from "./token";
import initVersion from "./version";

const umzug = new Umzug({
  migrations,
  context: db.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize: db }),
  logger,
});

export const initDb = (async () => {
  try {
    await db.authenticate();
    logger.debug("Connection has been established successfully.");

    await umzug.up();
    logger.debug("Migrations have been run successfully.");

    initUser(db);

    initAuthor(db);
    initDistTag(db);
    initHook(db);
    initOrganization(db);
    initVersion(db);
    initPackage(db);
    initRegistry(db);
    initTarball(db);
    initTeam(db);
    initToken(db);

    await db.sync();
    logger.debug("Synced models");

    await User.addRootUser(db);

    return db;
  } catch (error) {
    logger.error(error, "Unable to connect to the database");
  }
})();
