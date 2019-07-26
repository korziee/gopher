import { GopherFileServer } from "../servers/file";
import { GopherNrlServer } from "../servers/nrl";
import { IGopherModule } from "../models/IGopherModule";
import { GopherJsonServer } from "../servers/json";

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
  return plugins;
};
