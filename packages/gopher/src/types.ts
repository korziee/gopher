import { GopherItem } from "./util";

/**
 * Represents the different gopher entities that clients will accept
 */
export enum GopherItemTypes {
  File = 0,
  Menu = 1,
  Error = 3,
  Search = 7,
  Binary = 9,
  Gif = "g",
  Html = "h",
  Info = "i",
}

export type GopherMap = string;

export interface GopherPlugin {
  /**
   * The selector of your gopher plugin
   *
   * @note this is used as a "selector" in the gopher text when the root server creates a directory listing with a child plugin's items.
   */
  selector: string;
  /**
   * The name to be displayed when a "directory listing" is received and you have multiple plugins.
   *
   * @note if you only have one plugin, this value will not be printed to the gopher client.`
   */
  descriptionShort: string;
  // descriptionLong: string;

  /**
   * You can use this method to initialise your `GopherPlugin`. The `GopherServer` will call this method
   * on each of your plugins before it starts accepting traffic.
   */
  init(): Promise<void>;
  /**
   * This method anticipates that you will handle the selector sent from the gopher client and respond with either an array of GopherItem (ready to be serialized) or a string (for files)!
   *
   * @note If you have multiple plugins being used at once:
   *
   * This method will receive the selector as if it was hitting the root level gopher server.
   * I.e. if the root server receives a handler "nrl/games", it will strip away the server selector "nrl"
   * and just pass "games" to the child server.
   */
  handleSelector(selector: string): Promise<GopherItem[] | string>;
}

export enum LogType {
  Info = "info",
  Debug = "debug",
  Error = "error",
}
