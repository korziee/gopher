import { GopherItemTypes } from "./types";

/**
 * Gopher helper class for use with gopher plugins.
 *
 * This class represents a single line of unserialized Gopher text.
 * Right before any text gets sent back to the client, the `GopherServer` will call the `serialize` method on each item.
 */
export class GopherItem {
  constructor(
    /**
     * The entity type of this GopherItem, e.g. a `1` for a Menu, or an "i" for an Info entity.
     */
    private type: GopherItemTypes,
    /**
     * The text to be displayed for in the Gopher client for this item
     */
    private description: string,
    /**
     * The selector is what makes this GopherItem unique to a client.
     *
     * E.g.
     * Lets say the selector is `/cats/shorthair` and is a directory entity type and the user selects this item in a gopher client, the gopher server will receive "/cats/shorthair" and will have to make a decision on how to handle that.
     */
    private selector?: string,
    /**
     * The hostname to use so that gopher clients know where to contact when they want a resource.
     *
     * @note in most cases, you will be fine to use the `hostname` passed into the `GopherPlugin`'s `init` method when the server starts.
     */
    private host?: string,
    /**
     * The port to use so that gopher clients know where to contact when they want a resource.
     *
     * @note in most cases, you will be fine to use the `port` passed into the `GopherPlugin`'s `init` method when the server starts.
     */
    private port?: number
  ) {
    this.type = type;
    this.description = description;

    // need a selector/host/port for all non info/errors?
    this.selector = selector;
    this.host = host;
    this.port = port;
  }

  // TODO: rootHandler seems like a rootserver specific thing that consumers should not need to worry about.
  public serialize(rootSelector?: string): string {
    const handler = rootSelector
      ? `${rootSelector}/${this.selector}`
      : this.selector;

    return `${this.type}${this.description}\t${handler || ""}\t${
      this.host || ""
    }\t${this.port || ""}\r\n`;
  }

  public static generateInfoItem(description: string): GopherItem {
    return new GopherItem(GopherItemTypes.Info, description);
  }

  public static generateEmptyItem(): GopherItem {
    return new GopherItem(GopherItemTypes.Info, "");
  }
}

export function isNewLine(value: string) {
  return value === "\r\n";
}
