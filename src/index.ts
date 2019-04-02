import { myContainer } from "./inversify.config";
import { IGopherFileServer } from "./servers/file";
import { TYPES } from "./types";

/**
 * What this server should do:
 * - Given a source directory location, list the files/folders in gopher protocol.
 * - The client should be able to select a folder, which should then display the sub contents
 * - The client should be able to select a file, which should then sent back the contents of the file.
 * - We should support only .txt files
 * - Listen on port 70.
 */

myContainer.get<IGopherFileServer>(TYPES.GopherFileServer);

// GopherServer.init()
//   .then(() => GopherServer.start())
//   .catch(console.error);
