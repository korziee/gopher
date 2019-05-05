import * as fsNoPromises from "fs";
import * as path from "path";
import {
  IPreGopher,
  isEmptyCRLF,
  transformInformationToGopherText
} from "../../core";
const fs = fsNoPromises.promises;

export class GopherFileServer {
  private directory: string;
  private debug: boolean;
  private root: string;

  constructor(root: string, directory: string, debug = false) {
    this.directory = directory;
    this.debug = debug;
    this.root = root;
  }

  public async handleInput(handle: string): Promise<string> {
    const direntPath = isEmptyCRLF(handle)
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
          handler: this.root + "/" + `${handle}/${directoryDirents[index]}`
        };
      });
      return transformInformationToGopherText(preGopher, "localhost");
    }
    return transformInformationToGopherText(
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
  }
}
