import { Command, Flags, ux } from "@oclif/core";
import { AxiosRequestConfig } from "axios";
import cli from "cli-ux";

export default abstract class AuthCommand extends Command {
  static flags = {
    help: Flags.help({ char: "h" }),
    token: Flags.string({
      default: process.env["ENV_TOKEN"],
      description:
        "Token to be used for authentication, uses NPM_TOKEN env variable if unspecified",
      exclusive: ["userpass"],
    }),
    registry: Flags.string({
      required: true,
      description: "URI pointing to your Nandu NPM Registry",
    }),
  };

  async init(): Promise<void> {
    await super.init();
  }

  async getCredentials() {
    const { flags } = await this.parse();
    const opts: AxiosRequestConfig = {};
    let password;

    if (flags) {
      if (!flags.token) {
        this.log("Enter your credentials");
        const username = await cli.prompt("username");
        password = (await cli.prompt("password", { type: "hide" })) as string;

        opts.auth = {
          username,
          password,
        };
      } else {
        password = await cli.prompt("password", { type: "hide" });

        opts.headers = {
          Authorization: `Bearer ${flags.token}`,
        };
      }
    }
    return { opts, password };
  }
}
