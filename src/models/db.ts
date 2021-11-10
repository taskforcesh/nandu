import { Sequelize } from "sequelize";
import config from "../../config";

export const db = new Sequelize(config.sequelize.uri);

const testConnection = async () => {
  try {
    await db.authenticate();
    console.log("Connection has been established successfully.");

    await db.sync();
    console.log("Synced models");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

testConnection();
