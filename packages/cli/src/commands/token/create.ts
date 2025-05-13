import { Flags, Args, ux } from "@oclif/core";
import { wrapAction } from "../../utils";

import AuthCommand from "../../auth-command";
import { addToken } from "../../services/nandu.service";

export default class TokenCreate extends AuthCommand {
  static description = "create a new token for given user";

  static examples = [`$ nandu start -p 4567`];

  static flags = {
    ...AuthCommand.flags,
    readonly: Flags.boolean({
      description: "generate a readonly token",
    }),
    "cidr-whitelist": Flags.string({
      description: "comma separated list of whitelisted cidrs",
    }),
  };

  static args = {
    user: Args.string({required: true})
  };

  async run() {
    const { args, flags } = await this.parse(TokenCreate);
    const { opts, password } = await this.getCredentials();

    // Ensure password is defined
    if (!password) {
      this.error('Password is required');
      return;
    }

    const { "cidr-whitelist": cidrWhitelist } = flags;

    wrapAction(ux.action, async () => {
      ux.action.start("creating token");

      const token = await addToken(
        flags.registry,
        args.user,
        password,
        opts,
        flags.readonly,
        cidrWhitelist
      );

      ux.action.stop();
      console.log(`New token created for user ${args.user}`, token);
    });
  }
}
