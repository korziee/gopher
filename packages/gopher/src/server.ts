import * as net from "net";

import { GopherItemTypes, GopherMap, GopherPlugin } from "./types";
import { GopherItem, isNewLine } from "./util";

/**
 * Used to start a gopher server.
 */
export class GopherServer {
  private plugins: GopherPlugin[] = [];

  /**
   * @param host The hostname that gets used to construct the root directory listing for all the plugins
   * @param port The port that gets used to construct the root directory listing for all the plugins
   *
   * @note both `host` and `port` are passed down to each {@link GopherPlugin} in the {@link GopherPlugin.init init} method.
   */
  constructor(private host: string, private port: number) {}

  public addPlugin(plugin: GopherPlugin) {
    if (plugin.selector.search(/\s/) !== -1) {
      throw new Error("Plugin selector cannot include any spaces");
    }

    this.plugins.push(plugin);
  }

  private cleanInput(input: string): string {
    // if empty, don't modify.
    if (isNewLine(input)) {
      return input;
    }
    // otherwise, remove the linebreaks
    return input.replace("\n", "").replace("\r", "");
  }

  // at the end of this, this method needs to return a gopher map
  // we need to first check if it is a root request, if it is and there is more than 1 plugin, return a simple gophermap that lists out the plugins=
  // if there is only one plugin, we want to directly list the gophermap for the root of that plugin
  // if the input is something like /file, we need to list the root of the file plugin
  // if the input is something like /file/thing, we need to pass "/thing" to the file plugin
  private async getGopherMap(input: string): Promise<GopherMap> {
    const [, pluginHandler, ...pluginMessage] = input.split("/");

    // make sure message is not too long, we don't want to be spammed or have a memory attack occur.
    if (input.length > 200) {
      return (
        new GopherItem(GopherItemTypes.Error, "Nice try...").serialize() + "."
      );
    }

    // unless an empty input for root, all requests require a prepended slash.
    if (!input.includes("/") && !isNewLine(input)) {
      return (
        new GopherItem(
          GopherItemTypes.Error,
          "All handlers begin with '/'"
        ).serialize() + "."
      );
    }

    /**
     * In Gopher, if the input is a CRLF, return the root directory, or index.
     * However, we also want to respond if the input only contains a "/\r\n" too.
     */
    if (isNewLine(input) || (input[0] === "/" && !pluginHandler)) {
      if (this.plugins.length === 1) {
        const plugin = this.plugins[0];

        const response = await plugin.handleSelector("\r\n");

        return typeof response === "string"
          ? response
          : response.map((r) => r.serialize(`/${plugin.selector}`)).join("") +
              ".";
      } else {
        return (
          this.plugins
            .map((plugin) =>
              new GopherItem(
                GopherItemTypes.Menu,
                plugin.descriptionShort,
                "/" + plugin.selector,
                this.host,
                this.port
              ).serialize()
            )
            .join("") + "."
        );
      }
    }

    const matchingPlugin = this.plugins.find(
      (p) => p.selector === pluginHandler
    );

    // if the pluginHandler does not exist in the plugins Map, we will not go further, as nothing exists
    if (!matchingPlugin) {
      return (
        new GopherItem(
          GopherItemTypes.Error,
          `Nothing found with the handler ${input}`
        ).serialize() + "."
      );
    }

    // we already know the parent exists here,
    // and now we know that it's not a root call to the parent.
    const res = await matchingPlugin.handleSelector(pluginMessage.join("/"));

    return typeof res === "string"
      ? res
      : res.map((r) => r.serialize(`/${matchingPlugin.selector}`)).join("") +
          ".";
  }

  /**
   * This method starts the {@link GopherServer}, it will initialise all of your {@link GopherPlugin}'s and start a
   * TCP server on the port you have given.
   */
  public async start() {
    await Promise.all(
      this.plugins.map(async (p) => p.init(this.host, this.port))
    );

    const server = net.createServer((socket) => {
      socket.once("data", async (data) => {
        const input = this.cleanInput(data.toString());
        const gopherMap = await this.getGopherMap(input);

        socket.write(gopherMap, () => socket.end());
      });

      socket.on("error", console.error);
    });

    server.on("error", (err) => {
      throw err;
    });

    server.listen(this.port, () => {
      console.log(`Gopher server started on ${this.port}`);
    });
  }
}

// async function bootstrap() {
//   const server = new GopherServer("localhost", 70);

//   class TestPlugin implements GopherPlugin {
//     descriptionLong = "I am ting plugin woooo!!";
//     descriptionShort = "test plugin";
//     name = "testplugin";

//     public async handleInput() {
//       return "hello from TestPlugin";
//     }

//     async init(): Promise<void> {}
//   }

//   class TingPlugin implements GopherPlugin {
//     descriptionLong = "I am ting plugin yeah";
//     descriptionShort = "ting plugin";
//     name = "tingplugin";

//     public async handleInput(input: string) {
//       if (input === "child_dir") {
//         return [
//           new GopherItem(
//             GopherItemTypes.File,
//             "another menu",
//             "child_dir/t",
//             "localhost",
//             70
//           ),
//         ];
//       }
//       // return "hello from TingPlugin";
//       return [
//         new GopherItem(
//           GopherItemTypes.Menu,
//           "child directory",
//           "child_dir",
//           "localhost",
//           70
//         ),
//         new GopherItem(
//           GopherItemTypes.Info,
//           "Info item",
//           "hey",
//           "localhost",
//           70
//         ),
//       ];
//     }

//     async init(): Promise<void> {}
//   }

//   server.addPlugin(new TestPlugin());
//   server.addPlugin(new TingPlugin());

//   await server.start();
// }

// bootstrap();
