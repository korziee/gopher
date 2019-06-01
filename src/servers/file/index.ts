import * as fsNoPromises from "fs";
import * as path from "path";
import { isEmptyCRLF } from "../../core";
import { IGopherServer } from "../../models/GopherServer";
import { IPreGopher } from "../../models/IPreGopher";
import { ItemTypes } from "../../models/ItemTypes";
const fs = fsNoPromises.promises;

export class GopherFileServer implements IGopherServer {
  private directory: string;
  private debug: boolean;

  public async handleInput(handle: string): Promise<IPreGopher[]> {
    const direntPath = isEmptyCRLF(handle)
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
        } else if (type === null) {
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
