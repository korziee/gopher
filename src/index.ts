import { RootServer } from "./servers/root";
import { GopherNrlServer } from "./servers/nrl";
import { GopherFileServer } from "./servers/file";

/**
 * What this server should do:
 * - Given a source directory location, list the files/folders in gopher protocol.
 * - The client should be able to select a folder, which should then display the sub contents
 * - The client should be able to select a file, which should then sent back the contents of the file.
 * - We should support only .txt files
 * - Listen on port 70.
 */

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
