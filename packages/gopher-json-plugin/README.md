# Gopher JSON Plugin

This plugin enables you to serve and visualize JSON in your gopherhole. It will

## Requirements

- Node 14

## Usage with a GopherServer

```typescript
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
```

## Running the Example

1. Pull down this monorepo from GitHub.
2. Run `yarn install`
3. Run `cd packages/gopher-json-plugin`
4. Run `yarn example`
5. Use your Gopher client of choice to make a request to gopher://localhost:70
