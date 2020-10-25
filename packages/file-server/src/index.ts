import * as path from "path";
import { GopherServer } from "@korziee/gopher";

import { GopherFilePlugin } from "./plugin";

async function bootstrap() {
  const server = new GopherServer("localhost", 70);

  server.addPlugin(new GopherFilePlugin(path.join(__dirname, "../sample")));

  await server.start();
}

bootstrap();
