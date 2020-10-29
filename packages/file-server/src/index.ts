import * as path from "path";
import * as fs from "fs/promises";
import {
  GopherPlugin,
  isNewLine,
  GopherItem,
  GopherItemTypes,
} from "@korziee/gopher";

export class GopherFilePlugin implements GopherPlugin {
  descriptionShort = "A gopher directory...";
  selector = "file";

  constructor(private directory: string) {}

  public async init() {
    if (
      (await this.getGopherItemTypeForDirent(this.directory)) !==
      GopherItemTypes.Menu
    ) {
      throw new Error(
        "Root directory must exist when a new gopher file server is created."
      );
    }
  }

  public async handleSelector(input: string): Promise<string | GopherItem[]> {
    const direntPath = isNewLine(input)
      ? this.directory
      : path.join(this.directory, input);

    const direntType = await this.getGopherItemTypeForDirent(direntPath);

    switch (direntType) {
      case GopherItemTypes.Menu: {
        const isDirectoyListingRequest = isNewLine(input);

        const directoryDirents = await fs.readdir(direntPath);

        const directoryGopherItems = await Promise.all(
          directoryDirents.map(async (dirent: string) =>
            this.getGopherItemTypeForDirent(`${direntPath}/${dirent}`)
          )
        );

        const error = directoryGopherItems.some(
          (d) => d === GopherItemTypes.Error
        );

        if (error) {
          return [
            new GopherItem(
              GopherItemTypes.Error,
              "There was an error getting a directory a listing"
            ),
          ];
        }

        return directoryGopherItems.map(
          (gopherItemType, index) =>
            new GopherItem(
              gopherItemType,
              directoryDirents[index],
              isDirectoyListingRequest
                ? directoryDirents[index]
                : input + "/" + directoryDirents[index]
            )
        );
      }
      case GopherItemTypes.File: {
        const fileContents = await fs.readFile(direntPath, {
          encoding: "utf8",
        });
        return fileContents;
      }
      case GopherItemTypes.Error:
      default: {
        return [new GopherItem(GopherItemTypes.Error, "There was an error")];
      }
    }
  }

  private async getGopherItemTypeForDirent(
    direntPath: string
  ): Promise<GopherItemTypes> {
    let result;

    try {
      result = await fs.stat(direntPath);
    } catch (err) {
      console.error(err);
      return GopherItemTypes.Error;
    }

    if (result.isFile()) {
      return GopherItemTypes.File;
    }

    if (result.isDirectory()) {
      return GopherItemTypes.Menu;
    }

    return GopherItemTypes.Error;
  }
}
