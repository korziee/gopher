import * as fsNoPromises from "fs";
import { inject, injectable } from "inversify";
import * as net from "net";
import * as path from "path";
import { IGopherCore } from "../../core";
import { IPreGopher } from "../../models";
import { TYPES } from "../../types";

const fs = fsNoPromises.promises;

export interface IGopherFileServer {
  /**
   * Will start the gopher server.
   */
  start: () => void;
  /** Initialiases the gopher server, this must be run before starting. */
  init: () => Promise<void>;
}

@injectable()
export class GopherFileServer implements IGopherFileServer {
  private directory: string;
  private server: net.Server;
  private initialised = false;
  private debug: boolean;

  constructor(
    directory: string,
    debug = false,
    @inject(TYPES.GopherCore) private _gopherCore: IGopherCore
  ) {
    this.directory = directory;
    this.debug = debug;
  }

  private async getGopher(handle: string): Promise<string> {
    const direntPath = this._gopherCore.isEmptyCRLF(handle)
      ? this.directory
      : path.join(this.directory, handle);

    const direntType = await this.getDirentType(direntPath);

    if (direntType === "file") {
      return await fs.readFile(direntPath, { encoding: "utf8" });
    }

    if (direntType === "directory") {
      const directoryDirents = await fs.readdir(direntPath);
      const directoryContents = await Promise.all(
        directoryDirents.map(async (dirent: string) =>
          this.getDirentType(`${direntPath}/${dirent}`)
        )
      );
      const preGopher: IPreGopher[] = directoryContents.map((type, index) => {
        let selector;
        if (type === "file") {
          selector = 0;
        } else if (type === "directory") {
          selector = 1;
        } else if (type === null) {
          selector = 3;
        }
        return {
          selector,
          description: directoryDirents[index],
          handler: `${handle}/${directoryDirents[index]}`
        };
      });
      return this._gopherCore.transformInformationToGopherText(
        preGopher,
        "localhost"
      );
    }
    return this._gopherCore.transformInformationToGopherText(
      [
        {
          selector: 3,
          description: "There was an error.",
          handler: "Error"
        }
      ],
      "localhost"
    );
  }

  private async handleUserInput(
    data: Buffer,
    socket: net.Socket
  ): Promise<void> {
    const message = this._gopherCore.filterInput(data.toString());

    const response = await this.getGopher(message);

    socket.write(response);
    socket.end();
  }

  private debugLog(type: "log" | "warn" | "error", message: any): void {
    if (this.debug) {
      if (type === "log") {
        console.log("DEBUG: ", message);
        return;
      }
      if (type === "warn") {
        console.warn("DEBUG: ", message);
        return;
      }
      if (type === "error") {
        console.error("DEBUG: ", message);
        return;
      }
    }
  }

  private async getDirentType(
    direntPath: string
  ): Promise<"directory" | "file" | "error" | null> {
    let result;
    try {
      result = await fs.stat(direntPath);
    } catch (err) {
      this.debugLog("error", err);
      return "error";
    }
    const file = result.isFile();
    const directory = result.isDirectory();
    if (file) {
      return "file";
    }
    if (directory) {
      return "directory";
    }
    return null;
  }

  public async init() {
    const type = await this.getDirentType(this.directory);
    if (type !== "directory") {
      throw new Error(
        "Root directory must exist when a new gopher file server is created."
      );
    }
    this.server = net.createServer(socket => {
      socket.on("data", data => {
        this.handleUserInput(data, socket);
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

  public start() {
    if (!this.initialised) {
      throw new Error(
        "You must run .init on the constructed gopher file server."
      );
    }
    this.server.listen(70, () => {
      console.log("Gopher server started on port 70!");
    });
  }
}
