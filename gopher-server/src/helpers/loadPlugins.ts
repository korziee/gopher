import { GopherFileServer } from "../servers/file";
import { GopherNrlServer } from "../servers/nrl";
import { IGopherModule } from "gopher-core/lib/models/IGopherModule";
import { GopherJsonServer } from "../servers/json";
import { GopherMapServer } from "../servers/gopher-map";

export const loadPlugins = () => {
  const plugins: IGopherModule[] = [];

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

  if (process.env.GOPHER_JSON_PLUGIN === "true") {
    plugins.push({
      class: GopherJsonServer,
      descriptionLong: "Check out this lit json to gopher converter",
      descriptionShort: "JSON TO GOPHER",
      handler: "json"
    });
  }

  if (process.env.GOPHER_MAP_PLUGIN === "true") {
    if (!process.env.GOPHER_MAP_PLUGIN_DIRECTORY) {
      throw new Error(
        "To enable gopher map plugin, ensure a directory is set in the environment file"
      );
    }
    plugins.push({
      class: GopherMapServer,
      descriptionLong: "Gopher holes created using files, folders, gophermaps!",
      descriptionShort: "GOPHER MAP",
      handler: "map",
      initParams: {
        // TODO - add check in for the trailing slash
        dir: process.env.GOPHER_MAP_PLUGIN_DIRECTORY
      }
    });
  }
  return plugins;
};
