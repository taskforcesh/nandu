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
  {
    name: "20251117-add-timestamps-to-packages-and-versions",
    up: async function ({ context: queryInterface }: any) {
      // Add timestamps to Packages table
      let packagesTable;
      try {
        packagesTable = await queryInterface.describeTable("Packages");
      } catch (err) {
        // Table doesn't exist yet, skip
        return;
      }

      if (!packagesTable.createdAt) {
        await queryInterface.addColumn("Packages", "createdAt", {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        });
      }
      if (!packagesTable.updatedAt) {
        await queryInterface.addColumn("Packages", "updatedAt", {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        });
      }

      // Add timestamps to Versions table
      let versionsTable;
      try {
        versionsTable = await queryInterface.describeTable("Versions");
      } catch (err) {
        // Table doesn't exist yet, skip
        return;
      }

      if (!versionsTable.createdAt) {
        await queryInterface.addColumn("Versions", "createdAt", {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        });
      }
      if (!versionsTable.updatedAt) {
        await queryInterface.addColumn("Versions", "updatedAt", {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        });
      }
    },
    down: async function ({ context: queryInterface }: any) {
      await queryInterface.removeColumn("Packages", "createdAt");
      await queryInterface.removeColumn("Packages", "updatedAt");
      await queryInterface.removeColumn("Versions", "createdAt");
      await queryInterface.removeColumn("Versions", "updatedAt");
    },
  },
];
