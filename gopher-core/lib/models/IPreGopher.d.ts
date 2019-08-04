import { ItemTypes } from "./ItemTypes";
export interface IPreGopher {
    type: ItemTypes;
    description: string;
    handler?: string;
    host?: string;
    port?: number | string;
    isRaw?: boolean;
}
