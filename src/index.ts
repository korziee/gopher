import { GopherFileServer } from "./servers/file";
import { GopherNrlServer } from "./servers/nrl";
import { RootServer } from "./servers/root";

if (!process.env.PORT) {
  throw Error("PORT is required, please set it in the env file.");
}

if (!process.env.HOST) {
  throw Error("HOST is required, please set it in the env file.");
}

const server = new RootServer(
  process.env.HOST,
  parseInt(process.env.PORT, 10),
  [
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
  ]
);

server.init().then(() => {
  server.start();
});
