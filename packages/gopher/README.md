# Gopher

This package houses utility classes and types that will allow you to construct a Gopher server in Node.

## Getting Started Example (TypeScript)

```typescript
import {
  GopherItem,
  GopherItemTypes,
  GopherPlugin,
  GopherServer,
  isNewLine,
} from "@korziee/gopher";

/**
 * A simple gopher plugin example, it responds with a root directory listing of cats and dogs.
 * Depending on the users selection, the plugin will then display a directory listing of a couple
 * of the different breeds.
 */
class AnimalGopherPlugin implements GopherPlugin {
  selector = "animals";
  descriptionShort = "A gopher plugin displaying animals!";

  public async init() {
    // we don't need to do any initialisation for this plugin.
  }

  public async handleSelector(
    selector: string
  ): Promise<GopherItem[] | string> {
    // user or client is requesting a directory listing
    if (isNewLine(selector)) {
      return [
        new GopherItem(GopherItemTypes.Menu, "Cats", "cats"),
        new GopherItem(GopherItemTypes.Menu, "Dogs", "dogs"),
      ];
    }

    switch (selector) {
      case "dogs": {
        const breeds = ["Boxer", "Doberman", "Labrador", "Retriever"];
        return breeds.map(
          (breed) =>
            // Info item types do not require a hostname or port as no navigation can occur from them, it's more or less just a neat way to print text onto the gopher client.
            new GopherItem(GopherItemTypes.Info, breed, breed.toLowerCase())
        );
      }
      case "cats": {
        const breeds = ["Persian", "Maine Coon", "Siamese", "Short Hair"];
        return breeds.map(
          (breed) =>
            // Info item types do not require a hostname or port as no navigation can occur from them, it's more or less just a neat way to print text onto the gopher client.
            new GopherItem(GopherItemTypes.Info, breed, breed.toLowerCase())
        );
      }
      default: {
        throw new Error("unknown selector");
      }
    }
  }
}

const server = new GopherServer("localhost", 70);

server.addPlugin(new AnimalGopherPlugin());

server.start();
```

## Documentation

The rest of the documentation (including useful types) can be found [here](https://korziee.github.io/gopher/)
