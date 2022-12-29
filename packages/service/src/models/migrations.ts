import { DataTypes } from "sequelize";

export const migrations = [
  {
    // the name of the migration is mandatory
    name: "20221014-2349-add-reset-password-columns",
    up: async function ({ context: queryInterface }: any) {
      let table;
      try {
        table = await queryInterface.describeTable("Users");
      } catch (err) {
        // Just return since the table doesn't exist yet.
        return;
      }

      if (!table.passwordResetToken) {
        await queryInterface.addColumn(
          "Users",
          "passwordResetToken",
          DataTypes.STRING
        );
      }
      if (!table.passwordResetExpires) {
        await queryInterface.addColumn(
          "Users",
          "passwordResetExpires",
          DataTypes.DATE
        );
      }
    },
    down: async function ({ context: queryInterface }: any) {
      await queryInterface.removeColumn("Users", "passwordResetToken");
      await queryInterface.removeColumn("Users", "passwordResetExpires");
    },
  },
];
