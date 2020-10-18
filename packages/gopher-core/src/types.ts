import { GopherItem } from "./util";

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
  name: string;
  descriptionShort: string;
  descriptionLong: string;

  init: () => Promise<void>;
  /**
   * This method will receive the user input as if it was hitting the root level gopher server.
   * I.e. if the root server receives a handler "nrl/games", it will strip away the server selector "nrl"
   * and just pass "games" to the child server.
   *
   * This method anticipates that you will handle the handler input and respond with either an array of GopherItem (ready to be serialized) or a string (for files)!
   */
  handleInput: (input: string) => Promise<GopherItem[] | string>;
}
