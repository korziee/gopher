import { IGopherMap } from "../models/IGopherMap";
import { IPreGopher } from "../models/IPreGopher";
import { ItemTypes } from "../models/ItemTypes";
import { injectable } from "inversify";

export type GopherMap = Map<string, IGopherMap>;

export interface IGopherCore {
  isEmptyCRLF: (input: string) => boolean;
  transformInformationToGopherText: (dir: IPreGopher[]) => IGopherMap;
  generateGopherFromAscii(ascii: string): IPreGopher[];
  generateGopherInfoMessage(message: string): IPreGopher;
  generateEmptyGopherLine(): IPreGopher;
  // convertJsonToGopherMap(json: Object): GopherMap;
}

@injectable()
export class GopherCore implements IGopherCore {
  /**
   * Transforms input to gopher.
   *
   * @param dir
   */
  public transformInformationToGopherText(preGopher: IPreGopher[]): IGopherMap {
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
