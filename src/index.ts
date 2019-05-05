// import { GopherFileServer } from "./servers/file";
// import { GopherNrlServer } from "./servers/nrl";
import { RootServer } from "./servers/root";

/**
 * What this server should do:
 * - Given a source directory location, list the files/folders in gopher protocol.
 * - The client should be able to select a folder, which should then display the sub contents
 * - The client should be able to select a file, which should then sent back the contents of the file.
 * - We should support only .txt files
 * - Listen on port 70.
 */

/**
 * Essentially we want a master gopher server,
 * one that serves all of the servers in the server folder at the root only, and then for requests after
 * the root they are dispersed to the relevant server.
 */

// const GopherServer = new GopherNrlServer();

// GopherServer.init()
//   .then(() => GopherServer.start())
//   .catch(console.error);

const server = new RootServer("localhost");
server.init().then(() => {
  server.start();
});
