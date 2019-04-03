import "reflect-metadata";

import { Container } from "inversify";
import { GopherCore, IGopherCore } from "./core";
import { GopherFileServer, IGopherFileServer } from "./servers/file";
import { Symbols } from "./symbols";

const myContainer = new Container();

myContainer.bind<IGopherCore>(Symbols.GopherCore).to(GopherCore);
myContainer
  .bind<IGopherFileServer>(Symbols.GopherFileServer)
  .to(GopherFileServer);

export { myContainer };
