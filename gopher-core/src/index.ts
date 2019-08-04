import { IGopherMap } from "./models/IGopherMap";
import { IPreGopher } from "./models/IPreGopher";
import { ItemTypes } from "./models/ItemTypes";
import * as _ from "lodash";

export type GopherMap = Map<string, IGopherMap>;

export interface IGenerateGopherMapFromJsonParam {
  json: Object;
  selector?: string;
  customHandler?: string;
}

export interface IGopherCore {
  isEmptyCRLF: (input: string) => boolean;
  transformInformationToGopherText: (dir: IPreGopher[]) => IGopherMap;
  generateGopherFromAscii(ascii: string): IPreGopher[];
  generateGopherMapFromJson(
    params: IGenerateGopherMapFromJsonParam
  ): IPreGopher[];
  generateGopherInfoMessage(message: string): IPreGopher;
  generateEmptyGopherLine(): IPreGopher;
}

export class GopherCore implements IGopherCore {
  private generateGopherMapFromObject(object: Object): IPreGopher[] {
    return Object.keys(object).map(key => {
      return {
        description: key,
        handler: key,
        type: ItemTypes.Menu
      } as IPreGopher;
    });
  }

  public generateGopherMapFromJson({
    customHandler,
    json,
    selector
  }: IGenerateGopherMapFromJsonParam): IPreGopher[] {
    // no selector, return root level map of the json.
    if (!selector) {
      const gopherMap = this.generateGopherMapFromObject(json);
      if (!customHandler) {
        return gopherMap;
      }
      return gopherMap.map(x => ({
        ...x,
        handler: customHandler + x.handler
      }));
    }

    const property = _.get(json, selector);

    // it's objectlike, for json this means it's either an array or an object, return a directory
    if (_.isObject(property)) {
      let menu = this.generateGopherMapFromObject(property).map(x => ({
        ...x,
        handler: selector + "." + x.handler
      }));

      if (customHandler) {
        menu = menu.map(x => ({
          ...x,
          handler: customHandler + x.handler
        }));
      }

      return menu;
    }

    // it's a property on the object, return the contents directly
    return [this.generateGopherInfoMessage(property)];
  }
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
