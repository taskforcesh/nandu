export * from "./create";
export * from "./ls";

import { Command, flags } from "@oclif/command";
import cli from "cli-ux";
import axios, { AxiosRequestConfig } from "axios";

export default class Token extends Command {
  static description = "Manage NPM Registry tokens";

  static examples = [`$ nandu token:create myuser`];

  async run() {}
}
