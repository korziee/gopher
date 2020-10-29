# Gopher File Plugin

This plugin enables you to serve a directory and it's contents as gopher.

## Requirements

- Node 14

## Usage with a GopherServer

```typescript
import * as path from "path";
import { GopherServer } from "@korziee/gopher";
import { GopherFilePlugin } from "@korziee/gopher-file-plugin`

async function bootstrap() {
  const server = new GopherServer("localhost", 70);

  // Note, you will need to have a directory called "sample" for this to work.
  server.addPlugin(new GopherFilePlugin(path.join(__dirname, "./sample")));

  await server.start();
}

bootstrap();
```

## Running the Example

1. Pull down this monorepo from GitHub.
2. Run `yarn install`
3. Run `cd packages/gopher-file-plugin`
4. Run `yarn example`
5. Use your Gopher client of choice to make a request to gopher://localhost:70
