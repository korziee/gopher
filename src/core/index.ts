import { GopherText } from "../models";

export enum ItemTypes {
  File = 0,
  Menu = 1,
  Error = 3,
  Binary = 9,
  Gif = "g",
  Html = "h",
  Info = "i"
}

export interface IPreGopher {
  type: ItemTypes;
  description: string;
  handler: string;
  host: string;
  port: number | string;
}

export const generateEmptyGopherLine = (): IPreGopher => ({
  description: "",
  handler: "",
  type: ItemTypes.Info,
  host: "",
  port: ""
});

export const generateGopherInfoMessage = (message: string): IPreGopher => ({
  description: message,
  handler: "",
  type: ItemTypes.Info,
  host: "",
  port: ""
});

export const generateGopherFromAscii = (ascii: string): IPreGopher[] => {
  const lines = ascii.split("\n");
  const preGopher = lines.map(generateGopherInfoMessage);
  return preGopher;
};

/**
 * Transforms input to gopher.
 *
 * @param dir
 */
export const transformInformationToGopherText = (
  preGopher: IPreGopher[]
): GopherText => {
  const gopherText =
    preGopher.reduce((gopher, entry) => {
      return (gopher += `${entry.type}${entry.description}\t${entry.handler}\t${
        entry.host
      }\t${entry.port}\r\n`);
    }, "") + "."; // . is the termination character.
  return gopherText;
};

/**
 * Tests if the input is an empty newline or (\r\n)
 * @param input
 */
export const isEmptyCRLF = (input: string) => input === "\r\n";

export const filterInput = (input: string): string => {
  if (isEmptyCRLF(input)) {
    return input;
  }
  return input.replace("\n", "").replace("\r", "");
};
