import { ItemTypes } from "./ItemTypes";
export interface IPreGopher {
  type: ItemTypes | string;
  description: string;
  // handler is required if this is a directory
  handler?: string;
  // host and port are overwritten and set by the root server
  host?: string;
  port?: number | string;
  // when specified to be true it means that it is usually a file or an img, and should be returned explicitly.
  isRaw?: boolean;
}
