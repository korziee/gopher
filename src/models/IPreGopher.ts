import { ItemTypes } from "./ItemTypes";
export interface IPreGopher {
  type: ItemTypes;
  description: string;
  handler: string;
  // host and port are overwritten and set by the root server
  host?: string;
  port?: number | string;
}
