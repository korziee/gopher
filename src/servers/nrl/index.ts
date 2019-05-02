import { getMatchesByRound, INrlMatch } from "@korziee/nrl/compiled/index";
import * as datefns from "date-fns";
import * as net from "net";
import {
  emptyGopherLine,
  filterInput,
  IPreGopher,
  isEmptyCRLF,
  transformInformationToGopherText
} from "../../core";

interface IGopherNrlMatch extends INrlMatch {
  id: string;
}

export interface IGopherNrlServer {
  /**
   * Will start the gopher server.
   */
  start: () => void;
  /** Initialises the gopher server, this must be run before starting. */
  init: () => void;
}

export class GopherNrlServer implements IGopherNrlServer {
  private server: net.Server;
  private initialised: boolean;
  private games: IGopherNrlMatch[];

  private async fetchNrlGames(): Promise<IGopherNrlMatch[]> {
    if (this.games) {
      return this.games;
    }
    const games = await getMatchesByRound();
    this.games = games.map(game => ({
      ...game,
      id: `${game.homeTeam.name}-${game.awayTeam.name}`.toLowerCase()
    }));
    return this.games;
  }

  private async getGopher(message: string): Promise<string> {
    const games = await this.fetchNrlGames();
    if (isEmptyCRLF(message)) {
      // return list as games.
      const gamesStarted: IPreGopher[] = games
        .filter(game => ["Post", "Current"].includes(game.matchMode))
        .map(
          (game): IPreGopher => ({
            description: `${game.homeTeam.name} Vs ${game.awayTeam.name}`,
            handler: game.id,
            selector: 1
          })
        );

      const gamesNotYetStarted: IPreGopher[] = games
        .filter(game => ["Pre"].includes(game.matchMode))
        .map(
          (game): IPreGopher => ({
            description: `${game.homeTeam.name} Vs ${game.awayTeam.name}`,
            handler: game.id,
            selector: 1
          })
        );

      return transformInformationToGopherText(
        [
          {
            description: "Games Below This Have Started",
            handler: "",
            selector: "i"
          },
          ...gamesStarted,
          emptyGopherLine(),
          {
            description: "Games Below This Have Not Started",
            handler: "",
            selector: "i"
          },
          ...gamesNotYetStarted
        ],
        ""
      );
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
          description: `(H) ${selectedGame.homeTeam.name} - ${
            selectedGame.homeTeam.score
          }`,
          handler: selectedGame.homeTeam.name,
          selector: "i"
        },
        {
          description: `(A) ${selectedGame.awayTeam.name} - ${
            selectedGame.awayTeam.score
          }`,
          handler: selectedGame.awayTeam.name,
          selector: "i"
        },
        emptyGopherLine(),
        {
          description: `Venue - ${selectedGame.venue}`,
          handler: "",
          selector: "i"
        },
        {
          description: `Kickoff - ${datefns.format(
            selectedGame.clock.kickOffTime,
            "dddd Do MMM, h:mm a"
          )}`,
          handler: "",
          selector: "i"
        },
        {
          description: `Game Clock - ${selectedGame.clock.currentGameTime}`,
          handler: "",
          selector: "i"
        }
      ],
      "localhost"
    );
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
