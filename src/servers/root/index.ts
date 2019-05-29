import * as datefns from "date-fns";
import * as fsNoProm from "fs";
import * as net from "net";

import {
  filterInput,
  generateEmptyGopherLine,
  generateGopherFromAscii,
  generateGopherInfoMessage,
  ItemTypes,
  transformInformationToGopherText
} from "../../core";
import { GopherServer } from "../../models/GopherServer";
import { GopherFileServer } from "../file";
import { GopherNrlServer } from "../nrl";

const fs = fsNoProm.promises;

// create the classes
// initiate them
// start a root gopher server
// lists the name of the two servers
// any request to either of them

export class RootServer implements GopherServer<null> {
  private server: net.Server;
  private host: string;
  private initialised = false;
  /**
   * String containing the contents on the banner message.
   */
  private banner: string;

  private NrlServer = new GopherNrlServer("nrl");
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

  private async handleData(data: Buffer, socket: net.Socket): Promise<void> {
    const message = filterInput(data.toString());
    console.log("Message received", message);

    // root call to nrl, mimic root call with \r\n
    if (message === "nrl") {
      const res = await this.NrlServer.handleInput("\r\n");
      socket.write(res);
      socket.end();
      return;
    }
    // check if not root call, but still call to nrl
    if (message.includes("nrl")) {
      const [, ...content] = message.split("/");
      const res = await this.NrlServer.handleInput(content.join());
      socket.write(res);
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
      generateGopherInfoMessage(datefns.format(new Date(), "Do of MMM YYYY")),
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
