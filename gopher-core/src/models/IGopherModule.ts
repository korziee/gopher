import { IGopherServerConstructor } from "./GopherServer";

export interface IGopherModule {
  handler: string;
  descriptionLong: string;
  descriptionShort: string;
  class: IGopherServerConstructor;
  initParams?: any;
}
