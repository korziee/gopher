import { GopherFileServer } from "./servers/file";
import { GopherNrlServer } from "./servers/nrl";
import { RootServer } from "./servers/root";

if (!process.env.PORT) {
  throw Error("PORT is required, please set it in the env file.");
}

if (!process.env.HOST) {
  throw Error("HOST is required, please set it in the env file.");
}

const plugins = [];

if (process.env.GOPHER_NRL_PLUGIN === "true") {
  plugins.push({
    handler: "nrl",
    descriptionShort: "NRL GAMES",
    descriptionLong: "Check the scores of the current round of the NRL",
    class: GopherNrlServer
  });
}
if (process.env.GOPHER_FILE_PLUGIN === "true") {
  if (!process.env.GOPHER_FILE_PLUGIN_DIRECTORY) {
    throw new Error(
      "File plugin directory is required if file plugin is set to true!"
    );
  }
  plugins.push({
    handler: "file",
    descriptionShort: "FILE SERVER",
    descriptionLong: "Some files!",
    initParams: {
      directory: process.env.GOPHER_FILE_PLUGIN_DIRECTORY,
      debug: false
    },
    class: GopherFileServer
  });
}

const server = new RootServer(
  process.env.HOST,
  parseInt(process.env.PORT, 10),
  plugins
);

server.init().then(() => {
  server.start();
});
