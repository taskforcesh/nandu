export * from "./add";

import { Command } from "@oclif/core";

export default class User extends Command {
  static description = "Manage NPM Registry users";

  static examples = [`$ nandu user:add myuser`];

  async run() {}
}
