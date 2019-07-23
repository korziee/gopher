import { IGopherText } from "../models/IGopherText";
import { IPreGopher } from "../models/IPreGopher";
import { ItemTypes } from "../models/ItemTypes";
import { injectable } from "inversify";

export type GopherMap = Map<string, IGopherText>;

export interface IGopherCore {
  filterInput: (input: string) => string;
  isEmptyCRLF: (input: string) => boolean;
  transformInformationToGopherText: (dir: IPreGopher[]) => IGopherText;
  generateGopherFromAscii(ascii: string): IPreGopher[];
  generateGopherInfoMessage(message: string): IPreGopher;
  generateEmptyGopherLine(): IPreGopher;
  convertJsonToGopherMap(json: Object): GopherMap;
}

@injectable()
export class GopherCore implements IGopherCore {
  public convertJsonToGopherMap(json: Object): GopherMap {
    const TrailingGopherMap: GopherMap = new Map();

    //     A function that takes in a “parents” handle and then keeps passing down the handle based on if a child exists. I wonder how this returns any values.

    // // { foo: {} }
    // const convertJsonToGopherMap = () => {}

    // {
    //   foo: "hello world",
    //   banana: [“pre”, “pop”],
    //   apple: [
    // 	{
    // 		type: “orange”
    // 	},
    // 	“pawn”
    //   ]
    //   bar: {
    //     barval: "lorem ipsum"
    //     baz: {
    //       bazval: "testing"
    //     }
    //   }
    // }

    // / =
    //   1 - foo - /foo
    //   1 - bar - /bar
    //   1 - banana - /banana
    //   1 - apple - /apple

    // /apple =
    //   1 - 0 - /apple[0]
    //   1 - 1 - /apple[1]

    // /apple[0] =
    //   1 - type - /apple[0]/type

    // /apple[0]/type =
    //   i - “orange” - null

    // /banana =
    //  i - “pre” - null
    //  i - “pop” - null

    // /foo =
    //   i - "hello world" - null

    // /bar =
    //   1 - barval - /bar/barval
    //   1 - baz - /bar/baz

    // /bar/barval =
    //   i - "lorem ipsum" - null

    // /bar/baz =
    //   1 - bazval - /bar/baz/bazval

    // /bar/baz/bazval =
    //   i - "testing" - null

    // const recurser = (parentPath: string) => {

    // }

    // Object.keys(json).forEach((key) => {
    //   if (Object.)
    // });

    return TrailingGopherMap;
  }
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
