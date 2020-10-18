import { GopherItemTypes } from "./types";

export class GopherItem {
  constructor(
    private type: GopherItemTypes,
    private description: string,
    private handler?: string,
    private host?: string,
    private port?: number
  ) {
    this.type = type;
    this.description = description;
    this.handler = handler;
    this.host = host;
    this.port = port;
  }

  // TODO: rootHandler seems like a rootserver specific thing that consumers should not need to worry about.
  public serialize(rootHandler?: string): string {
    const handler = rootHandler
      ? `${rootHandler}/${this.handler}`
      : this.handler;

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
