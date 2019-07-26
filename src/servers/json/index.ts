import { IGopherServer } from "../../models/GopherServer";
import { injectable, inject } from "inversify";
import { Symbols } from "../../symbols";
import { IGopherCore } from "../../core";
import { IPreGopher } from "../../models/IPreGopher";
import * as _ from "lodash";
import { ItemTypes } from "../../models/ItemTypes";
import axios from "axios";
import * as uuid from "uuid";
import { getTime } from "date-fns";

export type IGopherJsonServerInput = { [key: string]: any };

/**
 * TODO
 *
 * Refactor this file!
 */

@injectable()
export class GopherJsonServer implements IGopherServer {
  // the json to iterate over
  private jsonRequestMap: Map<
    string,
    { data: any; timestamp: number }
  > = new Map();

  constructor(@inject(Symbols.GopherCore) private _gopherCore: IGopherCore) {}

  private async fetchJson(url: string) {
    const response = await axios.get(url);
    return response.data;
  }

  private cleanupInMemoryJsonRequestMaps(thresholdInSeconds: number) {
    const currentTime = getTime(new Date());
    const mapContents = [...this.jsonRequestMap.entries()];

    mapContents.forEach(([key, value]) => {
      if (value.timestamp - thresholdInSeconds < currentTime) {
        // less than cleanup value, we don't need to clear it yet
        return;
      }
      // remove from map
      this.jsonRequestMap.delete(key);
    });
  }

  public async init() {
    // run cleanup every 60 seconds.
    setInterval(() => {
      this.cleanupInMemoryJsonRequestMaps(60 * 5);
    }, 60000);
  }

  private getGopherMenuFromObjectLikeValue(value: any): IPreGopher[] {
    return Object.keys(value).map(key => {
      return {
        description: key,
        handler: key,
        type: ItemTypes.Menu
      } as IPreGopher;
    });
  }

  private getGopherFromJsonByInput(input: string, json: any): IPreGopher[] {
    // query is for the root. return a listing of the contents
    if (this._gopherCore.isEmptyCRLF(input)) {
      return this.getGopherMenuFromObjectLikeValue(json);
    }

    const property = _.get(json, input);

    // it's objectlike, for json this means it's either an array or an object, return a directory
    if (_.isObject(property)) {
      const menu = this.getGopherMenuFromObjectLikeValue(property).map(x => ({
        ...x,
        handler: input + "." + x.handler
      }));

      return menu;
    }

    // it's a property on the object, return the contents directly
    return [
      {
        description: property,
        type: ItemTypes.Info
      }
    ];
  }

  /**
   * This was made in less than an hour and does not pay any attention
   * to the facts
   * - any network calls are not validated
   * - this service will fall over after like 10 requests
   * - ay lol big TODO
   */
  public async handleInput(input: string): Promise<IPreGopher[]> {
    if (this._gopherCore.isEmptyCRLF(input)) {
      // return the search directory
      return [
        {
          description: "Enter the URL of the json you wish to view.",
          type: ItemTypes.Info
        },
        {
          description:
            "Nothing is validated and this server will die if you don't use perfect json data :sadfaceemoji:",
          type: ItemTypes.Info
        },
        {
          description: "Click enter to bring up query box!",
          handler: "search",
          type: ItemTypes.Search
        }
      ];
    }

    const [selector, searchquery] = input.split("\t");

    if (selector === "search") {
      console.log("making search and setting uuid on req");
      let json;
      try {
        json = await this.fetchJson(searchquery);
      } catch (e) {
        return [
          {
            description:
              "ya god damn had to try and break it didn't you? Asshole.",
            type: ItemTypes.Info
          }
        ];
      }
      const id = uuid.v4();
      this.jsonRequestMap.set(id, {
        data: json,
        timestamp: getTime(new Date())
      });
      const res = await this.getGopherMenuFromObjectLikeValue(json).map(x => ({
        ...x,
        handler: id + "/" + x.handler
      }));
      return res;
    }

    const [id, innerSelector] = selector.split("/");

    const mapValue = this.jsonRequestMap.get(id);

    if (!mapValue) {
      return [
        {
          description:
            "Contents of json were cleared/timedout, please try the search again!",
          type: ItemTypes.Info
        }
      ];
    }

    const value = this.getGopherFromJsonByInput(
      innerSelector,
      mapValue.data
    ).map(x => ({
      ...x,
      handler: id + "/" + x.handler
    }));
    return value;
  }
}
