import "reflect-metadata";

import { Container } from "inversify";
import { GopherCore, IGopherCore } from "./core";
import { GopherFileServer } from "./servers/file";
import { Symbols } from "./symbols";
import { IGopherServer } from "./models/GopherServer";
import { GopherNrlServer } from "./servers/nrl";
import { IRootGopherServer, RootServer } from "./servers/root";

const myContainer = new Container();

myContainer.bind<IGopherCore>(Symbols.GopherCore).to(GopherCore);
myContainer.bind<IGopherServer>(Symbols.GopherFileServer).to(GopherFileServer);
myContainer.bind<IGopherServer>(Symbols.GopherNrlServer).to(GopherNrlServer);
myContainer.bind<IRootGopherServer>(Symbols.GopherRootServer).to(RootServer);

export { myContainer };
