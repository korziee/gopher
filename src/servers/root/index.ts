import * as datefns from "date-fns";
import * as fsNoProm from "fs";
import * as net from "net";

import { getDateStringInSydney } from "../../helpers/getDateStringInSydney";
import { IPreGopher } from "../../models/IPreGopher";
import { ItemTypes } from "../../models/ItemTypes";
import { IGopherServer } from "../../models/GopherServer";
import { IGopherText } from "../../models/IGopherText";
import { IGopherModule } from "../../models/IGopherModule";
import { IRootStates } from "../../models/IRootStates";
import { IGopherCore } from "../../core";
import { Symbols } from "../../symbols";
import { injectable, inject } from "inversify";

const fs = fsNoProm.promises;

export interface IRootGopherServer {
  init: any;
  start: any;
}

@injectable()
export class RootServer implements IRootGopherServer {
  constructor(@inject(Symbols.GopherCore) private _gopherCore: IGopherCore) {}

  private host: string;
  private port: number;
  private plugins: Map<
    string,
    Pick<
      IGopherModule,
      "descriptionLong" | "descriptionShort" | "initParams" | "handler"
    > & { class: IGopherServer }
  > = new Map();

  private server: net.Server;
  private initialised = false;
  /**
   * String containing the contents on the banner message.
   */
  private banner: string;

  /**
   * Returns the state in which a path should be chosen based on the input.
   *
   * I.e., if there are no slashes, this will return no_slash, in which a decision can be made to proceed.
   */
  private getStateFromUserInput(input: string): IRootStates {
    const [, pluginHandler, ...pluginMessage] = input.split("/");

    /**
     * In Gopher, if the input is a CRLF, return the root directory, or index.
     * However, we also want to respond if the input only contains a "/\r\n" too.
     */
    if (
      this._gopherCore.isEmptyCRLF(input) ||
      (input[0] === "/" && !pluginHandler)
    ) {
      return "root_listing";
    }

    // make sure message is not too long, we don't want to be spammed or have a memory attack occur.
    if (input.length > 200) {
      return "message_too_long";
    }

    // unless an empty input for root, all requests require a prepended slash.
    if (!input.includes("/")) {
      return "no_slash_found";
    }

    // if the pluginHandler does not exist in the plugins Map, we will not go further, as nothing exists
    if (!this.plugins.has(pluginHandler)) {
      return "not_found";
    }

    // we already know the parent exists here,
    // and now we know that it's not a root call to the parent.
    if (pluginMessage.length > 0) {
      return "child_handle";
    }

    return "child_listing";
  }

  /**
   * Returns gopher to return to the client based on the state param
   *
   * @param state
   * @param input
   */
  private async getGopherByState(
    state: IRootStates,
    input: string
  ): Promise<IGopherText> {
    const [, pluginHandler, ...pluginMessage] = input.split("/");
    if (state === "root_listing") {
      const pluginMessages: IPreGopher[] = [...this.plugins.values()]
        .map(
          (v): IPreGopher[] => {
            return [
              this._gopherCore.generateGopherInfoMessage(v.descriptionLong),
              {
                description: v.descriptionShort,
                handler: "/" + v.handler,
                type: ItemTypes.Menu,
                host: this.host,
                port: this.port
              }
            ];
          }
        )
        .flat();

      return this._gopherCore.transformInformationToGopherText([
        ...this._gopherCore.generateGopherFromAscii(this.banner),
        this._gopherCore.generateEmptyGopherLine(),
        this._gopherCore.generateEmptyGopherLine(),
        this._gopherCore.generateGopherInfoMessage(
          datefns.format(getDateStringInSydney(), "Do of MMM YYYY")
        ),
        this._gopherCore.generateEmptyGopherLine(),
        ...pluginMessages
      ]);
    }

    if (state === "no_slash_found") {
      return this._gopherCore.transformInformationToGopherText([
        {
          description: "All handlers begin with '/'",
          handler: "",
          host: this.host,
          port: this.port,
          type: ItemTypes.Error
        }
      ]);
    }

    if (state === "message_too_long") {
      return this._gopherCore.transformInformationToGopherText([
        {
          description: "Nice try...",
          handler: "",
          host: this.host,
          port: this.port,
          type: ItemTypes.Error
        }
      ]);
    }

    if (state === "not_found") {
      return this._gopherCore.transformInformationToGopherText([
        {
          description: `Nothing found with the handler '${input}'`,
          handler: "",
          host: this.host,
          port: this.port,
          type: ItemTypes.Error
        }
      ]);
    }

    if (state === "child_handle") {
      const preGopher = await this.plugins
        .get(pluginHandler)
        .class.handleInput(pluginMessage.join("/"));

      return this._gopherCore.transformInformationToGopherText(
        this.appendRootServerInfo(preGopher, pluginHandler)
      );
    }

    if (state === "child_listing") {
      const preGopher = await this.plugins
        .get(pluginHandler)
        .class.handleInput("\r\n");

      return this._gopherCore.transformInformationToGopherText(
        this.appendRootServerInfo(preGopher, pluginHandler)
      );
    }

    throw new Error("Unknown gopher state, could not be decifered");
  }

  /**
   * Adds the plugins to the class.
   *
   * @param plugins an array of static gopher servers
   */
  private addPlugins(plugins: IGopherModule[]) {
    plugins.forEach(plugin => {
      /**
       * Spread the plugin because we use all of the metadata,
       * but we overwrite the "class" property on IGopherModule as
       * we actually use an instantiated class, i.e. IGopherServer
       */
      this.plugins.set(plugin.handler, {
        ...plugin,
        // todo - lol bit of hack hahah
        class: new plugin.class(this._gopherCore)
      });
    });
  }

  private async loadBannerMessage() {
    const banner = await fs.readFile(process.cwd() + "/banner.txt", "utf8");
    this.banner = banner;
  }

  /**
   * If the preGopher has come from a child server, this appends the child servers name to the selector
   *
   * Also adds in hostname and port.
   */
  private appendRootServerInfo(
    preGopher: IPreGopher[],
    rootHandler?: string
  ): IPreGopher[] {
    return preGopher.map(x => ({
      ...x,
      handler: rootHandler ? `/${rootHandler}/${x.handler}` : x.handler,
      port: this.port,
      host: this.host
    }));
  }

  /**
   * Based on the user input, sends gopher down the socket connection
   *
   * @param data
   * @param socket
   */
  private async handleData(data: Buffer, socket: net.Socket): Promise<void> {
    const message = this._gopherCore.filterInput(data.toString());
    console.log("Message received", message);

    // get the state based on the input
    const state = this.getStateFromUserInput(message);

    // build then gopher based on the state
    const gopher = await this.getGopherByState(state, message);

    socket.write(gopher, () => {
      socket.end();
    });
  }

  public async init(hostname: string, port: number, plugins: IGopherModule[]) {
    this.host = hostname;
    this.port = port;
    this.addPlugins(plugins);

    // initialise all plugins.
    await Promise.all(
      [...this.plugins.values()].map(g => g.class.init(g.initParams))
    );
    // load banner
    await this.loadBannerMessage();

    this.server = net.createServer(socket => {
      socket.once("data", data => {
        this.handleData(data, socket);
      });
      socket.once("close", hadError => {
        if (hadError) {
          console.log("there was an error onclose.");
        }
      });
      socket.on("error", console.error);
    });
    this.server.on("error", err => {
      throw err;
    });
    this.initialised = true;
  }

  public async start() {
    if (!this.initialised) {
      throw new Error("You must run .init on the constructed gopher server.");
    }
    this.server.listen(this.port, () => {
      console.log(`Gopher server started at ${this.host} on port ${this.port}`);
    });
  }
}
