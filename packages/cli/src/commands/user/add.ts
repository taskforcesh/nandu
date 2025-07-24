import AuthCommand from "../../auth-command";
import { addUser } from "../../services/nandu.service";
import { wrapAction } from "../../utils";
import { Args, ux } from "@oclif/core";
import cli from "cli-ux";

export default class UserAdd extends AuthCommand {
  static description = "add or update a new token for given user";

  static examples = [`$ nandu user:add myuser`];

  static flags = {
    ...AuthCommand.flags,
  };

  static args = {
    user: Args.string({required: true})
  };

  async run() {
    const { args, flags } = await this.parse(UserAdd);
    const { opts } = await this.getCredentials();

    this.log("Enter new user credentials");
    const password = await cli.prompt("password", { type: "hide" });
    const email = await cli.prompt("email");

    wrapAction(ux.action, async () => {
      ux.action.start("adding user");

      await addUser(flags.registry, args.user, password, email, opts);

      ux.action.stop();
    });
  }
}
