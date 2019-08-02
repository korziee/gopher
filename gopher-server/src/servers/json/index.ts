import { IGopherServer } from "gopher-models/GopherServer";
import { IPreGopher } from "gopher-models/IPreGopher";
import { ItemTypes } from "gopher-models/ItemTypes";
import { injectable, inject } from "inversify";
import { Symbols } from "../../symbols";
import { IGopherCore } from "gopher-core/src/index";
import * as _ from "lodash";
import axios from "axios";
import * as uuid from "uuid";
import { getTime } from "date-fns";

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

  private async handleRootRequest() {
    // return the search directory
    return [
      this._gopherCore.generateGopherInfoMessage(
        "Enter the URL of the json you wish to view."
      ),
      this._gopherCore.generateGopherInfoMessage(
        "Nothing is validated and this server will die if you don't use perfect json data :sadfaceemoji:"
      ),
      {
        description: "Click enter to bring up query box!",
        handler: "search",
        type: ItemTypes.Search
      }
    ];
  }

  public async init() {
    // run cleanup every 60 seconds.
    setInterval(() => {
      this.cleanupInMemoryJsonRequestMaps(60 * 5);
    }, 60000);
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
      const response = await this.handleRootRequest();
      return response;
    }

    const [selector, searchquery] = input.split("\t");

    if (selector === "search") {
      console.log("making search and setting uuid on req");
      let json;
      try {
        json = await this.fetchJson(searchquery);
      } catch (e) {
        return [
          this._gopherCore.generateGopherInfoMessage(
            "ya god damn had to try and break it didn't you? Asshole."
          )
        ];
      }

      const id = uuid.v4();
      this.jsonRequestMap.set(id, {
        data: json,
        timestamp: getTime(new Date())
      });

      const response = await this._gopherCore.generateGopherMapFromJson({
        json: json,
        customHandler: id + "/"
      });
      return response;
    }

    const [id, innerSelector] = selector.split("/");

    const mapValue = this.jsonRequestMap.get(id);

    if (!mapValue) {
      return [
        this._gopherCore.generateGopherInfoMessage(
          "Contents of json were cleared/timedout, please try the search again!"
        )
      ];
    }

    const value = this._gopherCore.generateGopherMapFromJson({
      customHandler: id + "/",
      json: mapValue.data,
      selector: innerSelector
    });
    return value;
  }
}
