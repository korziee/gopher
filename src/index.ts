import { RootServer } from "./servers/root";
import { GopherNrlServer } from "./servers/nrl";
import { GopherFileServer } from "./servers/file";

if (!process.env.PORT) {
  throw Error("PORT is required, please set it in the env file.");
}

if (!process.env.HOST) {
  throw Error("HOST is required, please set it in the env file.");
}

const server = new RootServer(process.env.HOST, [
  {
    handler: "nrl",
    descriptionShort: "NRL GAMES",
    descriptionLong: "Check the scores of the current round of the NRL",
    class: GopherNrlServer
  },
  {
    handler: "file",
    descriptionShort: "FILE SERVER",
    descriptionLong: "Some files!",
    initParams: {
      directory: "/Users/koryporter/Projects/gopher/directory",
      debug: false
    },
    class: GopherFileServer
  }
]);

server.init().then(() => {
  server.start();
});
