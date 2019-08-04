import "reflect-metadata";

import { Container, decorate, injectable } from "inversify";
import { GopherCore, IGopherCore } from "gopher-core/lib/logic";
import { IGopherServer } from "gopher-core/lib/models/GopherServer";

import { GopherFileServer } from "./servers/file";
import { Symbols } from "./symbols";
import { GopherNrlServer } from "./servers/nrl";
import { IRootGopherServer, RootServer } from "./servers/root";

const myContainer = new Container();

// gopher core is not exported as injectable.
decorate(injectable(), GopherCore);

myContainer.bind<IGopherCore>(Symbols.GopherCore).to(GopherCore);
myContainer.bind<IGopherServer>(Symbols.GopherFileServer).to(GopherFileServer);
myContainer.bind<IGopherServer>(Symbols.GopherNrlServer).to(GopherNrlServer);
myContainer.bind<IRootGopherServer>(Symbols.GopherRootServer).to(RootServer);

export { myContainer };
