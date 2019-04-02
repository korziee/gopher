import { Container } from "inversify";
import { GopherCore, IGopherCore } from "./core";
import { GopherFileServer, IGopherFileServer } from "./servers/file";
import { TYPES } from "./types";

const myContainer = new Container();

myContainer.bind<IGopherCore>(TYPES.GopherCore).to(GopherCore);
myContainer
  .bind<IGopherFileServer>(TYPES.GopherFileServer)
  .to(GopherFileServer);

export { myContainer };
