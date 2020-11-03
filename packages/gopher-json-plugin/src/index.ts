import {
  GopherItem,
  GopherItemTypes,
  GopherPlugin,
  isNewLine,
} from "@korziee/gopher";

import get from "lodash.get";

/**
 * Given a JSON object this should server gopher.
 */
export class JSONGopherPlugin implements GopherPlugin {
  descriptionShort =
    "A JSON gopher plugin, give it a JSON object and it will serve a directory like structure replicating the JSON";
  selector = "json";

  constructor(private json: { [key: string]: any }) {}

  public async init() {
    try {
      JSON.parse(JSON.stringify(this.json));
    } catch (e) {
      throw new Error(
        "Could not validate initial JSON object, please ensure you have provided valid JSON"
      );
    }
  }

  public async handleSelector(
    selector: string
  ): Promise<GopherItem[] | string> {
    // return the directory listing
    if (isNewLine(selector)) {
      return Object.keys(this.json).map((key) => {
        return new GopherItem(GopherItemTypes.Menu, key, key);
      });
    }

    const value = get(this.json, selector);

    if (["string", "number"].includes(typeof value)) {
      return [new GopherItem(GopherItemTypes.Info, value)];
    } else {
      return Object.keys(value).map((key) => {
        return new GopherItem(
          GopherItemTypes.Menu,
          key,
          // convert the selector into a valid JSON selector
          `${selector}["${key}"]`
        );
      });
    }
  }
}
