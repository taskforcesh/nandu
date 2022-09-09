import AuthCommand from "../../auth-command";
import { addUser } from "../../services/nandu.service";
import { wrapAction } from "../../utils";

import cli from "cli-ux";

export default class UserAdd extends AuthCommand {
  static description = "add or update a new token for given user";

  static examples = [`$ nandu user:add myuser`];

  static flags = {
    ...AuthCommand.flags,
  };

  static args = [{ name: "user", required: true }];

  async run() {
    const { args, flags } = this.parse(this.ctor);
    const { opts } = await this.getCredentials();

    cli.log("Enter new user credentials");
    const password = await cli.prompt("password", { type: "hide" });
    const email = await cli.prompt("email");

    wrapAction(cli.action, async () => {
      cli.action.start("adding user");

      await addUser(flags.registry, args.user, password, email, opts);

      cli.action.stop();
    });
  }
}
