export * from "./create";
export * from "./ls";

import { Command } from "@oclif/core";
import axios, { AxiosRequestConfig } from "axios";

export default class Token extends Command {
  static description = "Manage NPM Registry tokens";

  static examples = [`$ nandu token:create myuser`];

  async run() {}
}
