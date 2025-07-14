import { Command, Flags, Args, ux } from "@oclif/core";
import { AxiosRequestConfig } from "axios";
import { listTokens } from "../../services/nandu.service";
import { wrapAction } from "../../utils";
import cli from "cli-ux";

export default class TokenList extends Command {
  static description = "list tokens for given user";
  static examples = [`$ nandu start -p 4567`];

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

  static args = {
    user: Args.string({required: true})
  };

  async run() {
    const { args, flags } = await this.parse(TokenList);
    const opts: AxiosRequestConfig = {};

    let password;

    if (!flags.token) {
      const username = await cli.prompt("username");
      password = await cli.prompt("password", { type: "hide" });

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

    await wrapAction(ux.action, async () => {
      ux.action.start("listing tokens");
      const data = await listTokens(flags.registry, args.user, opts);
      ux.action.stop();
      console.log(data.objects);
    });
  }
}
