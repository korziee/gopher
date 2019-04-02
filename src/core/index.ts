import { injectable } from "inversify";
import "reflect-metadata";
import { GopherText, IPreGopher } from "../models";

export interface IGopherCore {
  filterInput: (input: string) => string;
  isEmptyCRLF: (input: string) => boolean;
  transformInformationToGopherText: (
    dir: IPreGopher[],
    hostname: string
  ) => GopherText;
}

@injectable()
export class GopherCore implements IGopherCore {
  public filterInput(input: string) {
    if (this.isEmptyCRLF(input)) {
      return input;
    }
    return input.replace("\n", "").replace("\r", "");
  }

  public isEmptyCRLF(input: string) {
    return input === "\r\n";
  }

  public transformInformationToGopherText(
    dir: IPreGopher[],
    hostname: string
  ): GopherText {
    return (
      dir.reduce((gopher, entry) => {
        return (gopher += `${entry.selector}${entry.description}\t${
          entry.handler
        }\t${hostname}\t${70}\r\n`);
      }, "") + "."
    ); // . is the termination character.
  }
}
