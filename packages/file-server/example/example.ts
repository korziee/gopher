import * as path from "path";
import { GopherServer } from "@korziee/gopher";

import { GopherFilePlugin } from "../src/index";

async function bootstrap() {
  const server = new GopherServer("localhost", 70);

  server.addPlugin(new GopherFilePlugin(path.join(__dirname, "./test-folder")));

  await server.start();
}

bootstrap();
