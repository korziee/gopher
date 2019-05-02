import * as net from "net";
import {
  filterInput,
  IPreGopher,
  isEmptyCRLF,
  transformInformationToGopherText
} from "../../core";

export interface IGopherNrlServer {
  /**
   * Will start the gopher server.
   */
  start: () => void;
  /** Initialises the gopher server, this must be run before starting. */
  init: () => void;
}

interface INrlGame {
  id: string;
  name: string;
  home: {
    name: string;
    score: number;
  };
  away: {
    name: string;
    score: number;
  };
}

export class GopherNrlServer implements IGopherNrlServer {
  private server: net.Server;
  private initialised: boolean;
  private games: INrlGame[];

  private async fetchNrlGames(): Promise<INrlGame[]> {
    if (this.games) {
      return this.games;
    }
    this.games = [
      {
        away: {
          name: "Broncos",
          score: 0
        },
        home: {
          name: "Rabbitohs",
          score: 24
        },
        id: "rabbitohs-broncos",
        name: "Rabbitohs Vs Broncos"
      }
    ];
    return this.games;
  }

  private async getGopher(message: string): Promise<string> {
    const games = await this.fetchNrlGames();
    console.log("un here", isEmptyCRLF(message));
    if (isEmptyCRLF(message)) {
      // return list as games.
      const nrlGames: IPreGopher[] = games.map(
        (game): IPreGopher => ({
          description: game.name,
          handler: game.id,
          selector: 1
        })
      );
      return transformInformationToGopherText(nrlGames, "localhost");
    }

    const selectedGame = games.find(g => g.id === message);

    if (!selectedGame) {
      return transformInformationToGopherText(
        [
          {
            description: "No Game Found",
            handler: "no-game",
            selector: 3
          }
        ],
        "localhost"
      );
    }

    return transformInformationToGopherText(
      [
        {
          description: `${selectedGame.home.name} - ${selectedGame.home.score}`,
          handler: selectedGame.home.name,
          selector: 1
        },
        {
          description: `${selectedGame.away.name} - ${selectedGame.away.score}`,
          handler: selectedGame.away.name,
          selector: 1
        }
      ],
      "localhost"
    );

    return "";
  }

  private async handleUserInput(data: Buffer, socket: net.Socket) {
    const message = filterInput(data.toString());
    const response = await this.getGopher(message);

    socket.write(response);
    socket.end();
  }

  public start() {
    if (!this.initialised) {
      throw new Error("You must run .init on the constructed gopher server.");
    }
    this.server.listen(70, () => {
      console.log("Gopher server started on port 70!");
    });
  }

  public async init() {
    this.server = net.createServer(socket => {
      socket.on("data", data => {
        this.handleUserInput(data, socket);
      });
      socket.on("close", hadError => {
        if (hadError) {
          console.log("there was an error onclose.");
        }
      });
    });
    this.server.on("error", err => {
      throw err;
    });
    this.initialised = true;
  }
}
