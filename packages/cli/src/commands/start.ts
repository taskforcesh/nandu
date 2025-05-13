import { Command, Flags } from "@oclif/core";
import { startServer } from "@nandu/service";

export default class Start extends Command {
  static description = "Starts Nandu Open NPM Server";

  static examples = [`$ nandu start -p 4567`];

  static flags = {
    help: Flags.help({ char: "h" }),
    // flag with a value (-p, --port=VALUE)
    port: Flags.integer({
      char: "p",
      description: "listen to port",
      default: 4567,
    }),

    // flag with no value (-f, --force)
    force: Flags.boolean({ char: "f" }),
  };

  async run() {
    const { flags } = await this.parse(Start);

    const { port } = flags;

    // Pass port and dashboard options to startServer
    startServer(port, { port: 3000, apiHost: `http://localhost:${port}` });
  }
}
