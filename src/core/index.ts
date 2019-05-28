import { GopherText } from "../models";

export interface IPreGopher {
  selector: number | "i";
  description: string;
  handler: string;
}
export const emptyGopherLine = (): IPreGopher => ({
  description: "",
  handler: "",
  selector: "i"
});

export const transformInformationToGopherText = (
  dir: IPreGopher[],
  hostname: string
): GopherText => {
  const gopherText =
    dir.reduce((gopher, entry) => {
      return (gopher += `${entry.selector}${entry.description}\t${
        entry.handler
      }\t${hostname}\t${process.env.PORT}\r\n`);
    }, "") + "."; // . is the termination character.
  return gopherText;
};

export const isEmptyCRLF = (input: string) => input === "\r\n";

export const filterInput = (input: string): string => {
  if (isEmptyCRLF(input)) {
    return input;
  }
  return input.replace("\n", "").replace("\r", "");
};
