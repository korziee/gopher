import * as fsNoPromises from "fs";
import * as path from "path";
import { inject, injectable } from "inversify";

import { IGopherCore } from "gopher-core/lib/logic";
import { IGopherServer } from "gopher-core/lib/models/GopherServer";
import { IPreGopher } from "gopher-core/lib/models/IPreGopher";
import { ItemTypes } from "gopher-core/lib/models/ItemTypes";

import { Symbols } from "../../symbols";
const fs = fsNoPromises.promises;

@injectable()
export class GopherFileServer implements IGopherServer {
  private directory!: string;
  private debug!: boolean;

  constructor(@inject(Symbols.GopherCore) private _gopherCore: IGopherCore) {}

  public async handleInput(handle: string): Promise<IPreGopher[]> {
    const direntPath = this._gopherCore.isEmptyCRLF(handle)
      ? this.directory
      : path.join(this.directory, handle);

    const direntType = await this.getDirentType(direntPath);

    if (direntType === "file") {
      const fileContents = await fs.readFile(direntPath, { encoding: "utf8" });
      return [
        {
          type: ItemTypes.File,
          description: fileContents,
          isRaw: true
        }
      ];
    }

    if (direntType === "directory") {
      const isRoot = handle.includes("\r\n") || handle.includes("\n\r");
      const directoryDirents = await fs.readdir(direntPath);
      const directoryContents = await Promise.all(
        directoryDirents.map(async (dirent: string) =>
          this.getDirentType(`${direntPath}/${dirent}`)
        )
      );
      const preGopher: IPreGopher[] = directoryContents.map((type, index) => {
        let selector;
        if (type === "file") {
          selector = ItemTypes.File;
        } else if (type === "directory") {
          selector = ItemTypes.Menu;
        } else {
          selector = ItemTypes.Error;
        }
        return {
          type: selector,
          description: directoryDirents[index],
          handler: isRoot
            ? directoryDirents[index]
            : handle + "/" + directoryDirents[index]
        };
      });
      return preGopher;
    }
    return [
      {
        type: ItemTypes.Error,
        description: "There was an error.",
        handler: "Error"
      }
    ];
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

  public async init({
    directory,
    debug = false
  }: {
    directory: string;
    debug?: boolean;
  }) {
    this.directory = directory;
    this.debug = debug;

    const type = await this.getDirentType(this.directory);
    if (type !== "directory") {
      throw new Error(
        "Root directory must exist when a new gopher file server is created."
      );
    }
  }
}
