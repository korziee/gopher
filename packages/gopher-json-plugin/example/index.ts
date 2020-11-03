import { GopherServer } from "@korziee/gopher";
import { JSONGopherPlugin } from "../src";

async function bootstrap() {
  const server = new GopherServer("localhost", 70);

  server.addPlugin(
    new JSONGopherPlugin({
      cats: {
        shorthair: {
          age: 10,
          traits: ["angry", "cute", "funny"],
        },
      },
      dogs: {
        labrador: {
          age: 5,
          traits: ["friendly", "loyal", "perpetually hungry"],
        },
      },
    })
  );

  await server.start();
}

bootstrap();
