import test from "ava";
import * as net from "net";
import { myContainer } from "../../../inversify.config";
import { IGopherFileServer } from "../../../servers/file";
import { Symbols } from "../../../symbols";

test("throws without first being initiliased", async t => {
  // myContainer.rebind(Symbols.GopherFileServer).to(MockGopherFileServer);
  const server = myContainer.get<IGopherFileServer>(Symbols.GopherFileServer);
  t.throws(server.start);
});

test.serial("Initialises", async t => {
  const server = myContainer.get<IGopherFileServer>(Symbols.GopherFileServer);
  await server.init(`${process.env.PWD}/src/tests/servers/file`);
  await server.start();
  const connection = net.createConnection({
    host: "localhost",
    port: 70
  });
  await new Promise(resolve => {
    connection.on("data", dt => {
      t.is(dt.toString(), "0index.ts\t/index.ts\tlocalhost\t70\r\n.");
      resolve();
    });

    connection.write("\r\n");
  });
});
