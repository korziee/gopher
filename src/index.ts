import "reflect-metadata";

import { myContainer } from "./inversify";
import { IRootGopherServer } from "./servers/root";
import { Symbols } from "./symbols";
import { loadPlugins } from "./helpers/loadPlugins";

if (!process.env.PORT) {
  throw Error("PORT is required, please set it in the env file.");
}

if (!process.env.HOST) {
  throw Error("HOST is required, please set it in the env file.");
}

const RootServer = myContainer.get<IRootGopherServer>(Symbols.GopherRootServer);

RootServer.init(
  process.env.HOST,
  parseInt(process.env.PORT, 10),
  loadPlugins()
).then(() => {
  RootServer.start();
});
