import { IGopherMap } from "../models/IGopherMap";
import { IPreGopher } from "../models/IPreGopher";
export declare type GopherMap = Map<string, IGopherMap>;
export interface IGenerateGopherMapFromJsonParam {
    json: Object;
    selector?: string;
    customHandler?: string;
}
export interface IGopherCore {
    isEmptyCRLF: (input: string) => boolean;
    transformInformationToGopherText: (dir: IPreGopher[]) => IGopherMap;
    generateGopherFromAscii(ascii: string): IPreGopher[];
    generateGopherMapFromJson(params: IGenerateGopherMapFromJsonParam): IPreGopher[];
    generateGopherInfoMessage(message: string): IPreGopher;
    generateEmptyGopherLine(): IPreGopher;
}
export declare class GopherCore implements IGopherCore {
    private generateGopherMapFromObject;
    generateGopherMapFromJson({ customHandler, json, selector }: IGenerateGopherMapFromJsonParam): IPreGopher[];
    /**
     * Transforms input to gopher.
     *
     * @param dir
     */
    transformInformationToGopherText(preGopher: IPreGopher[]): IGopherMap;
    /**
     * Tests if the input is an empty newline or (\r\n)
     * @param input
     */
    isEmptyCRLF(input: string): boolean;
    generateEmptyGopherLine(): IPreGopher;
    generateGopherInfoMessage(message: string): IPreGopher;
    generateGopherFromAscii(ascii: string): IPreGopher[];
}
