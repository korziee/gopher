import Chalk from "chalk";

import { GopherItemTypes, LogType } from "./types";

/**
 * Gopher helper class for use with gopher plugins.
 *
 * This class represents a single line of unserialized Gopher text.
 * Right before any text gets sent back to the client, the {@link GopherServer} will call the {@link GopherItem.serialize serialize} method on each item.
 *
 * This class also contains static utility methods for generating an empty line in Gopher (helpful if you want to space out your GopherHole!)
 * and also to generate a Gopher info line with you text of choice (Useful for things like a banner).
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
    public selector?: string,
    /**
     * The hostname to use so that gopher clients know where to contact when they want a resource.
     *
     * @note this is optional as in most cases you will not need to modify the hostname of a GopherItem unless you were planning on sending the client to a different GopherHole. By default, the {@link GopherServer} will set the hostname to be what was set when the server started.
     */
    public host?: string,
    /**
     * The port to use so that gopher clients know where to contact when they want a resource.
     *
     * @note this is optional as in most cases you will not need to modify the port of a GopherItem unless you were planning on sending the client to a different port. By default, the {@link GopherServer} will set the port to be what was set when the server started.
     */
    public port?: number
  ) {
    this.type = type;
    this.description = description;
    this.selector = selector;
    this.host = host;
    this.port = port;
  }

  public serialize(): string {
    return `${this.type}${this.description}\t${this.selector}\t${
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

/**
 * There are a lot of CRLF characters thrown around in the Gopher dictionary, this function simply takes an input and returns a boolean if the input is an empty CRLF character
 */
export function isNewLine(value: string) {
  return value === "\r\n" || value == "\n\r";
}

export function log(type: LogType, message: string, data?: any) {
  if (!process.env.DEBUG) {
    return;
  }

  switch (type) {
    case LogType.Info: {
      console.log(Chalk.bold.greenBright("INFO:"), message);
      break;
    }
    case LogType.Debug: {
      console.log(Chalk.bold.blueBright("DEBUG:"), message);
      break;
    }
    case LogType.Error: {
      console.log(Chalk.bold.redBright("ERROR:"), message);
      break;
    }
  }

  if (data) {
    // if it's a string we can manipulate and insert tabs so that the logs are clearer.
    if (typeof data === "string") {
      console.log(
        data
          .split("\n")
          .map((d) => `  ${d}`)
          .join("\n")
      );
    } else {
      console.log(data);
    }
  }
}

export function humaniseControlCharacters(data: string) {
  return data
    .toString()
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}
