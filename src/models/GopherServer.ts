// export interface IGopherServer<X> {
//   directory: string;
//   /**
//    * All servers must have an init method, in which a generic can be passed.
//    * This must return a promise.
//    */
//   init: (params: X) => Promise<void>;
//   start: () => void;
// }

export abstract class GopherServer<X> {
  public abstract init(params: X): Promise<void>;
  public abstract start(): void;
}
