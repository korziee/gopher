// import { GopherFileServer } from "./servers/file";
import { GopherNrlServer } from "./servers/nrl";

/**
 * What this server should do:
 * - Given a source directory location, list the files/folders in gopher protocol.
 * - The client should be able to select a folder, which should then display the sub contents
 * - The client should be able to select a file, which should then sent back the contents of the file.
 * - We should support only .txt files
 * - Listen on port 70.
 */

// const GopherServer = new GopherFileServer(
//   "/Users/koryporter/Projects/gopher/directory",
//   false
// );

const GopherServer = new GopherNrlServer();

GopherServer.init()
  .then(() => GopherServer.start())
  .catch(console.error);
