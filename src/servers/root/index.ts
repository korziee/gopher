import * as net from "net";
import { filterInput, transformInformationToGopherText } from "../../core";
import { GopherServer } from "../../models/GopherServer";
import { GopherFileServer } from "../file";
import { GopherNrlServer } from "../nrl";

// create the classes
// initiate them
// start a root gopher server
// lists the name of the two servers
// any request to either of them

export class RootServer implements GopherServer<null> {
  private server: net.Server;
  private host: string;
  private initialised = false;

  private NrlServer = new GopherNrlServer("nrl");
  private FileServer = new GopherFileServer(
    "file",
    "/Users/koryporter/Personal/Repos/gopher/directory",
    false
  );

  constructor(hostname: string) {
    this.host = hostname;
  }

  private async handleData(data: Buffer, socket: net.Socket): Promise<void> {
    const message = filterInput(data.toString());

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

    console.log(111, message);

    // default response, serves the root directory
    const response = transformInformationToGopherText(
      [
        {
          description: "NRL SCORES",
          handler: "nrl",
          selector: 1
        },
        {
          description: "FILE SERVER",
          handler: "file",
          selector: 1
        }
      ],
      this.host
    );

    socket.write(response);
    socket.end();
  }

  public async init() {
    await this.NrlServer.init();

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
    this.server.listen(3070, () => {
      console.log("Gopher server started on port 70!");
    });
  }
}
