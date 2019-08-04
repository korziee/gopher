import { IPreGopher } from "./IPreGopher";
export interface IGopherServer {
    /**
     * All servers must have an init method, in which a generic can be passed.
     * This must return a promise.
     */
    init: (params?: any) => Promise<void>;
    /**
     * This method will receive the user input as if it was hitting the root level gopher server.
     * I.e. if the root server receives a handler "nrl/games", it will strip away the server selector "nrl"
     * and just pass "games" to the child server.
     *
     * This method anticipates that you will handle the handler input and respond with usable PreGopher
     */
    handleInput: (input: string) => Promise<IPreGopher[]>;
}
export declare type IGopherServerConstructor = {
    new (...args: any[]): IGopherServer;
};
