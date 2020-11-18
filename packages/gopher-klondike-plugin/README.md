# Gopher Klondike Plugin

This gopher plugin provides you with the ability to play a game of a solitaire/klondike on your `GopherServer`.

It combines the [@korziee/klondike](https://www.npmjs.com/package/@korziee/klondike) engine package with Gopher!

## Usage with a GopherServer

```typescript
import { GopherServer } from "@korziee/gopher";
import { KlondikeGopherPlugin } from "@korziee/gopher-klondike-plugin";

async function bootstrap() {
  const server = new GopherServer("localhost", 70);

  server.addPlugin(new KlondikeGopherPlugin());

  await server.start();
}

bootstrap();
```

## Running the Example

1. Pull down this monorepo from GitHub.
2. Run `yarn install`
3. Run `cd packages/gopher-klondike-plugin`
4. Run `yarn start`
5. Use your Gopher client of choice to make a request to gopher://localhost:70
