/**
 * What this server should do:
 * - Given a source directory location, list the files/folders in gopher protocol.
 * - The client should be able to select a folder, which should then display the sub contents
 * - The client should be able to select a file, which should then sent back the contents of the file.
 * - We should support only .txt files
 * - Listen on port 70.
 */

import * as net from "net";
import * as path from "path";
import * as fsNoPromises from "fs";
const fs = fsNoPromises.promises;


const server = net.createServer((socket => {
  socket.setEncoding("utf8")
  socket.on("data", (data: Buffer) => {
    console.log("data received");
    handleUserInput(data, socket);
  });
  socket.on("end", () => {
    console.log("end event fired");
  })
  socket.on("close", (hadError) => {
    if (hadError) {
      console.log("there was an error onclose.")
    }
  });
}));

server.on('error', (err) => {
  throw err;
});

server.listen(70, () => {
  console.log('server bound');
});

const rootDir = "./directory";

export interface IFileData {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  location: string;
}

const transformToGopher = (dirContents: IFileData[]): string => {
  return dirContents.reduce((accum, file, index) => {
    let canonicalType = 3;
    if (file.isDirectory) {
      canonicalType = 1;
    } else if (file.isFile) {
      canonicalType = 0;
    }
    const descriptor = file.name;
    const fileName = file.name;
    const hostname = "localhost";
    const port = 70;

    /**
     * CANONICAL TYPE AND DESCRIPTOR MUST NOT HAVE A BREAK BETWEEN THEM!
     */
    accum += `${canonicalType}${descriptor}\t${fileName}\t${hostname}\t${port}\n`;

    if (index === (dirContents.length - 1)) {
      accum += ".";
    }

    return accum;
  }, "");
};

const isEmptyCRLF = (input: string) => {
  const [one, two] = input.split("\r\n");
  return one === "" && two === "";
}

const handleUserInput = async (text: string, socket: net.Socket): Promise<void> => {
  const isEmptyMessage = isEmptyCRLF(text);
  if (isEmptyMessage) {
    const directory = await fs.readdir(rootDir);
    const contents: IFileData[] = await Promise.all(directory.map(async item => {
      const location = path.join(__dirname, "../" + rootDir + "/" + item) 
      const stat = await fs.stat(location);
      return {
        isFile: stat.isFile(),
        isDirectory: stat.isDirectory(),
        location,
        name: item,
      }
    }));
    console.log("cool it's right!", JSON.stringify(transformToGopher(contents)));
    socket.write(transformToGopher(contents));
    socket.end();
    return;
  }
  console.log("no bueno")
  socket.end();
};

// gopher://localhost:70