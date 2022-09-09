import { flags } from "@oclif/command";
import { wrapAction } from "../../utils";

import AuthCommand from "../../auth-command";
import { addToken } from "../../services/nandu.service";

import cli from "cli-ux";

export default class TokenCreate extends AuthCommand {
  static description = "create a new token for given user";

  static examples = [`$ nandu start -p 4567`];

  static flags = {
    ...AuthCommand.flags,
    readonly: flags.boolean({
      description: "generate a readonly token",
    }),
    "cidr-whitelist": flags.string({
      description: "comma separated list of whitelisted cidrs",
    }),
  };

  static args = [{ name: "user", required: true }];

  async run() {
    const { args, flags } = this.parse(this.ctor);
    const { opts, password } = await this.getCredentials();

    const { "cidr-whitelist": cidrWhitelist } = flags;

    wrapAction(cli.action, async () => {
      cli.action.start("creating token");

      const token = await addToken(
        flags.registry,
        args.user,
        password,
        opts,
        flags.readonly,
        cidrWhitelist
      );

      cli.action.stop();
      console.log(`New token created for user ${args.user}`, token);
    });
  }
}
