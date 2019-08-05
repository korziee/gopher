import * as fs from "fs";
import { inject, injectable } from "inversify";

import { IGopherCore } from "gopher-core/lib/logic";
import { IGopherServer } from "gopher-core/lib/models/GopherServer";
import { IPreGopher } from "gopher-core/lib/models/IPreGopher";

import { Symbols } from "../../symbols";
import { ItemTypes } from "gopher-core/lib/models/ItemTypes";

@injectable()
export class GopherMapServer implements IGopherServer {
  private rootDirPath!: string;
  private rootListing!: IPreGopher[];

  // @ts-ignore
  constructor(@inject(Symbols.GopherCore) private _gopherCore: IGopherCore) {}

  // TODO - move to core
  // TODO - add unit tests
  private parseGopherMap(gopherMap: string): IPreGopher[] {
    // TODO - parse the gopher map
    const lines = gopherMap.split("\n");
    const gopherlines = lines.map(
      (l): IPreGopher => {
        const sections = l.split("\t");
        const [itemTypeAndDisplayString, selector, hostname, port] = sections;
        const itemType = itemTypeAndDisplayString[0];
        const displayString = itemTypeAndDisplayString.slice(1);
        return {
          description: displayString,
          handler: selector,
          host: hostname,
          port: port,
          type: itemType
        };
      }
    );
    return gopherlines;
  }

  private async getPathType(
    path: string
  ): Promise<"file" | "directory" | null> {
    const stat = await fs.promises.lstat(path);

    if (stat.isFile()) {
      return "file";
    }

    if (stat.isDirectory()) {
      return "directory";
    }

    return null;
  }

  private async loadRootListing(dir: string): Promise<void> {
    const rootGopherMap = await fs.promises.readFile(dir + "/gophermap", {
      encoding: "utf8"
    });
    const parsedRootGopherMap = this.parseGopherMap(rootGopherMap);
    this.rootListing = parsedRootGopherMap;
  }

  public async handleInput(handle: string): Promise<IPreGopher[]> {
    if (this._gopherCore.isEmptyCRLF(handle)) {
      return this.rootListing;
    }

    const path = this.rootDirPath + handle;
    const type = await this.getPathType(path);

    if (type === null) {
      // TODO - fix
      process.exit();
    }
    if (type === "file") {
      const fileContents = await fs.promises.readFile(path, {
        encoding: "utf8"
      });
      return [
        {
          type: ItemTypes.File,
          description: fileContents,
          isRaw: true
        }
      ];
    }
    if (type === "directory") {
      const gophermap = await fs.promises.readFile(path + "/gophermap", {
        encoding: "utf8"
      });
      return this.parseGopherMap(gophermap);
    }
    return this.rootListing;
  }

  public async init({ dir }: { dir: string }) {
    // set root path, we use that to join with the input in the `handleInput`
    // function to search for the directory/folder
    this.rootDirPath = dir;
    await this.loadRootListing(dir);
  }
}
