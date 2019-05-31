import * as datefns from "date-fns";
import * as fsNoProm from "fs";
import * as net from "net";

import {
  filterInput,
  generateEmptyGopherLine,
  generateGopherFromAscii,
  generateGopherInfoMessage,
  transformInformationToGopherText
} from "../../core";
import { getDateStringInSydney } from "../../helpers/getDateStringInSydney";
import { IPreGopher } from "../../models/IPreGopher";
import { ItemTypes } from "../../models/ItemTypes";
import { GopherFileServer } from "../file";
import { GopherNrlServer } from "../nrl";

const fs = fsNoProm.promises;

// create the classes
// initiate them
// start a root gopher server
// lists the name of the two servers
// any request to either of them

export interface IRootServer {
  init(): Promise<void>;
  start(): Promise<void>;
}

export class RootServer implements IRootServer {
  private server: net.Server;
  private host: string;
  private initialised = false;
  /**
   * String containing the contents on the banner message.
   */
  private banner: string;

  private NrlServer = new GopherNrlServer();
  private FileServer = new GopherFileServer(
    "file",
    "/Users/koryporter/Personal/Repos/gopher/directory",
    false
  );

  constructor(hostname: string) {
    this.host = hostname;
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
      handler: rootHandler ? `${rootHandler}/${x.handler}` : x.handler,
      port: process.env.PORT,
      host: process.env.HOST
    }));
  }

  private async handleData(data: Buffer, socket: net.Socket): Promise<void> {
    const message = filterInput(data.toString());
    console.log("Message received", message);

    // root call to nrl, mimic root call with \r\n
    if (message === "nrl") {
      const preGopher = await this.NrlServer.handleInput("\r\n");
      const gopher = transformInformationToGopherText(
        this.appendRootServerInfo(preGopher, "nrl")
      );
      socket.write(gopher);
      socket.end();
      return;
    }
    // check if not root call, but still call to nrl
    if (message.includes("nrl")) {
      const [, ...content] = message.split("/");
      const preGopher = await this.NrlServer.handleInput(content.join());
      const gopher = transformInformationToGopherText(
        this.appendRootServerInfo(preGopher, "nrl")
      );
      socket.write(gopher);
      socket.end();
      return;
    }

    if (message === "file") {
      const res = await this.FileServer.handleInput("\r\n");
      socket.write(res);
      socket.end();
      return;
    }

    if (message.includes("file")) {
      const [, ...content] = message.split("/");
      const res = await this.FileServer.handleInput(content.join());
      socket.write(res);
      socket.end();
      return;
    }

    // default response, serves the root directory
    const response = transformInformationToGopherText([
      ...generateGopherFromAscii(this.banner),
      generateEmptyGopherLine(),
      generateEmptyGopherLine(),
      generateGopherInfoMessage(
        datefns.format(getDateStringInSydney(), "Do of MMM YYYY")
      ),
      generateEmptyGopherLine(),
      generateGopherInfoMessage(
        "Check the scores of the current round of the NRL"
      ),
      {
        description: "NRL SCORES",
        handler: "nrl",
        type: ItemTypes.Menu,
        host: process.env.HOST,
        port: process.env.PORT
      },
      generateEmptyGopherLine(),
      {
        description: "FILE SERVER",
        handler: "file",
        type: ItemTypes.Menu,
        host: process.env.HOST,
        port: process.env.PORT
      }
    ]);

    socket.write(response);
    socket.end();
  }

  public async init() {
    await this.NrlServer.init();
    await this.loadBannerMessage();

    this.server = net.createServer(socket => {
      socket.on("data", data => {
        this.handleData(data, socket);
      });
      socket.on("close", hadError => {
        if (hadError) {
          console.log("there was an error onclose.");
        }
      });
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
    this.server.listen(process.env.PORT, () => {
      console.log(
        `Gopher server started at ${this.host} on port ${process.env.PORT}`
      );
    });
  }
}
