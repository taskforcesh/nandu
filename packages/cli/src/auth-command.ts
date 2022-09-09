import { Command, flags } from "@oclif/command";
import { Input, OutputArgs, OutputFlags } from "@oclif/parser";
import { AxiosRequestConfig } from "axios";
import cli from "cli-ux";

export default abstract class AuthCommand extends Command {
  static flags = {
    help: flags.help({ char: "h" }),
    token: flags.string({
      default: process.env["ENV_TOKEN"],
      description:
        "Token to be used for authentication, uses NPM_TOKEN env variable if unspecified",
      exclusive: ["userpass"],
    }),
    registry: flags.string({
      required: true,
      description: "URI pointing to your Nandu NPM Registry",
    }),
  };

  protected parsedArgs?: OutputArgs;
  protected flags?: OutputFlags<typeof AuthCommand.flags>;

  async init(): Promise<void> {
    const { args, flags } = this.parse(
      this.constructor as Input<typeof AuthCommand.flags>
    );
    this.flags = flags;
  }

  async getCredentials() {
    const { flags } = this;
    const opts: AxiosRequestConfig = {};
    let password;

    if (flags) {
      if (!flags.token) {
        cli.log("Enter your credentials");
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
