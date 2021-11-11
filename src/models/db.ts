import { Sequelize } from "sequelize";
import pino from "pino";

import config from "../../config";

const logger = pino({ name: "Sequelize", level: config.logLevel });

export const db = new Sequelize(config.sequelize.uri, {
  logging: (msg) => logger.debug(msg),
});

export const initDb = async () => {
  try {
    await db.authenticate();
    logger.debug("Connection has been established successfully.");

    await db.sync();
    logger.debug("Synced models");

    /**
     * Add root user if needed.
     */
    const { User } = await import("../models/user");
    await User.addRootUser();
  } catch (error) {
    logger.error(error, "Unable to connect to the database");
  }
};
