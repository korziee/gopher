export type GopherText = string;

export interface IFileData {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  location: string;
}

export interface IPreGopher {
  selector: number;
  description: string;
  handler: string;
}
