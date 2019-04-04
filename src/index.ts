import { myContainer } from "./inversify.config";
import { IGopherFileServer } from "./servers/file";
import { Symbols } from "./symbols";

const GopherServer = myContainer.get<IGopherFileServer>(
  Symbols.GopherFileServer
);

GopherServer.init(`${process.env.PWD}/directory`, true)
  .then(() => GopherServer.start())
  .catch(console.error);
