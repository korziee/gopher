import { getMatchesByRound, INrlMatch } from "@korziee/nrl/compiled/index";
import * as datefns from "date-fns";
import {
  emptyGopherLine,
  IPreGopher,
  isEmptyCRLF,
  transformInformationToGopherText
} from "../../core";

interface IGopherNrlMatch extends INrlMatch {
  id: string;
}

export class GopherNrlServer {
  private games: IGopherNrlMatch[];
  private nextFetch: number = 0;

  private root: string;

  constructor(rootDirectory: string) {
    this.root = rootDirectory;
  }

  private async fetchNrlGames(): Promise<IGopherNrlMatch[]> {
    const now = Math.floor(new Date().getTime() / 1000);
    if (now > this.nextFetch) {
      const games = await getMatchesByRound();
      this.games = games.map(game => ({
        ...game,
        id: `${game.homeTeam.name}-${game.awayTeam.name}`.toLowerCase()
      }));
      // add 10 seconds.
      this.nextFetch = now + 10;
    }
    return this.games;
  }

  public async handleInput(message: string): Promise<string> {
    const games = await this.fetchNrlGames();
    if (isEmptyCRLF(message)) {
      // return list as games.
      const gamesStarted: IPreGopher[] = games
        .filter(game => ["Post", "Live"].includes(game.matchMode))
        .map(
          (game): IPreGopher => ({
            description: `${game.homeTeam.name} Vs ${game.awayTeam.name}`,
            handler: this.root + "/" + game.id,
            selector: 1
          })
        );

      const gamesNotYetStarted: IPreGopher[] = games
        .filter(game => ["Pre"].includes(game.matchMode))
        .map(
          (game): IPreGopher => ({
            description: `${game.homeTeam.name} Vs ${game.awayTeam.name}`,
            handler: this.root + "/" + game.id,
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
            handler: this.root + "/" + "no-game",
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

  public async init() {
    await this.fetchNrlGames();
  }
}
