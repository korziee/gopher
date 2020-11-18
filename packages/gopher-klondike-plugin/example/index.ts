import { GopherServer } from "@korziee/gopher";
import { KlondikeGopherPlugin } from "../src";

async function bootstrap() {
  process.env.DEBUG = "true";
  const server = new GopherServer("localhost", 70);

  server.addPlugin(new KlondikeGopherPlugin());

  await server.start();
}

bootstrap();
