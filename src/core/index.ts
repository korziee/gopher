import { IGopherText } from "../models/IGopherText";
import { IPreGopher } from "../models/IPreGopher";
import { ItemTypes } from "../models/ItemTypes";
import { injectable } from "inversify";

export interface IGopherCore {
  filterInput: (input: string) => string;
  isEmptyCRLF: (input: string) => boolean;
  transformInformationToGopherText: (dir: IPreGopher[]) => IGopherText;
  generateGopherFromAscii(ascii: string): IPreGopher[];
  generateGopherInfoMessage(message: string): IPreGopher;
  generateEmptyGopherLine(): IPreGopher;
}

@injectable()
export class GopherCore implements IGopherCore {
  /**
   * Transforms input to gopher.
   *
   * @param dir
   */
  public transformInformationToGopherText(
    preGopher: IPreGopher[]
  ): IGopherText {
    const gopherText =
      preGopher.reduce((gopher, entry) => {
        if (entry.type === ItemTypes.File && entry.isRaw) {
          return entry.description;
        }
        return (gopher += `${entry.type}${entry.description}\t${
          entry.handler
        }\t${entry.host}\t${entry.port}\r\n`);
      }, "") + "."; // . is the termination character.
    return gopherText;
  }

  /**
   * Tests if the input is an empty newline or (\r\n)
   * @param input
   */
  public isEmptyCRLF(input: string) {
    return input === "\r\n";
  }

  public filterInput(input: string): string {
    if (this.isEmptyCRLF(input)) {
      return input;
    }
    return input.replace("\n", "").replace("\r", "");
  }

  public generateEmptyGopherLine(): IPreGopher {
    return {
      description: "",
      handler: "",
      type: ItemTypes.Info,
      host: "",
      port: ""
    };
  }

  public generateGopherInfoMessage(message: string): IPreGopher {
    return {
      description: message,
      handler: "",
      type: ItemTypes.Info,
      host: "",
      port: ""
    };
  }

  public generateGopherFromAscii(ascii: string): IPreGopher[] {
    const lines = ascii.split("\n");
    const preGopher = lines.map(this.generateGopherInfoMessage);
    return preGopher;
  }
}
