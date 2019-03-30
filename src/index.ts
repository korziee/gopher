/**
 * What this server should do:
 * - Given a source directory location, list the files/folders in gopher protocol.
 * - The client should be able to select a folder, which should then display the sub contents
 * - The client should be able to select a file, which should then sent back the contents of the file.
 * - We should support only .txt files
 * - Listen on port 70.
 */

import * as fsNoPromises from "fs";
import * as net from "net";
import * as path from "path";
import { publicDirectoryAbsolute } from "./config";
const fs = fsNoPromises.promises;

export type GopherText = string;

const hostname = "localhost";
const gopherPort = 70;

export interface IFileData {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  location: string;
}

const server = net.createServer(socket => {
  socket.on("data", data => {
    handleUserInput(data, socket);
  });
  socket.on("close", hadError => {
    if (hadError) {
      console.log("there was an error onclose.");
    }
  });
});

server.on("error", err => {
  throw err;
});

server.listen(70, () => {
  console.log("Gopher server started on port 70!");
});

const isEmptyCRLF = (input: string) => input === "\r\n";

const checkType = async (
  path: string
): Promise<"directory" | "file" | "error"> => {
  let result;
  let error = false;
  try {
    result = await fs.stat(path);
  } catch (err) {
    console.error(err);
    error = true;
  }
  if (error) {
    return "error";
  }
  const file = result.isFile();
  const directory = result.isDirectory();
  if (file) {
    return "file";
  }
  if (directory) {
    return "directory";
  }
  return "error";
};

export interface IPreGopher {
  selector: number;
  description: string;
  handler: string;
}

const transformDirectoryToGopherString = (dir: IPreGopher[]): string => {
  const unterminatedGopher = dir.reduce((gopher, entry) => {
    return (gopher += `${entry.selector}${entry.description}\t${
      entry.handler
    }\t${hostname}\t${gopherPort}\r\n`);
  }, "");
  return unterminatedGopher + "."; // . is the termination character.
};

const getGopherByFileHandle = async (handle: string): Promise<string> => {
  const selectorPath = path.join(publicDirectoryAbsolute, handle);
  const type = await checkType(selectorPath);
  if (type === "file") {
    return await fs.readFile(selectorPath, { encoding: "utf8" });
  }
  if (type === "directory") {
    const dirents = await fs.readdir(selectorPath);
    const contents = await Promise.all(
      dirents.map(async (dirent: string) => {
        return {
          type: await checkType(selectorPath + "/" + dirent),
          name: dirent
        };
      })
    );
    const preGopher: IPreGopher[] = contents.map(a => {
      let selector;
      if (a.type === "file") {
        selector = 0;
      } else if (a.type === "directory") {
        selector = 1;
      } else if (a.type === "error") {
        selector = 3;
      }
      return {
        selector,
        description: a.name,
        handler: handle + "/" + a.name
      };
    });
    return transformDirectoryToGopherString(preGopher);
  }
  return transformDirectoryToGopherString([
    {
      selector: 3,
      description: "There was an error",
      handler: "ERROR"
    }
  ]);
};

const filterInput = (input: string): string => {
  if (input === "\r\n") return input;
  return input.replace("\n", "").replace("\r", "");
};

const handleUserInput = async (
  text: Buffer,
  socket: net.Socket
): Promise<void> => {
  const message = filterInput(text.toString());
  const isEmptyMessage = isEmptyCRLF(message);

  let response;
  if (isEmptyMessage) {
    response = await getGopherByFileHandle(".");
  } else {
    response = await getGopherByFileHandle(message);
  }
  socket.write(response);
  socket.end();
};
