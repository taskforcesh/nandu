import { Command, flags } from "@oclif/command";
import { startServer } from "@nanduland/service";

export default class Start extends Command {
  static description = "Starts Nandu Open NPM Server";

  static examples = [`$ nandu start -p 4567`];

  static flags = {
    help: flags.help({ char: "h" }),
    // flag with a value (-p, --port=VALUE)
    port: flags.integer({
      char: "p",
      description: "listen to port",
      default: 4567,
    }),

    // flag with no value (-f, --force)
    force: flags.boolean({ char: "f" }),
  };

  async run() {
    const { flags } = this.parse(Start);

    const { port } = flags;

    startServer(port, true);
  }
}
