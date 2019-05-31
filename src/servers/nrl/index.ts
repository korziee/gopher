import { getMatchesByRound, INrlMatch } from "@korziee/nrl/compiled/index";
import * as datefns from "date-fns";
import {
  generateEmptyGopherLine,
  generateGopherInfoMessage,
  isEmptyCRLF
} from "../../core";
import { IGopherServer } from "../../models/GopherServer";
import { IPreGopher } from "../../models/IPreGopher";
import { ItemTypes } from "../../models/ItemTypes";

interface IGopherNrlMatch extends INrlMatch {
  id: string;
}

export class GopherNrlServer implements IGopherServer {
  private games: IGopherNrlMatch[];
  private nextFetch: number = 0;
  /**
   * Fetches nrl games through the nrl-crawler package.
   *
   * Caches games for 10 seconds.
   */
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

  public async handleInput(message: string): Promise<IPreGopher[]> {
    const games = await this.fetchNrlGames();
    if (isEmptyCRLF(message)) {
      // return list as games.
      const gamesStarted: IPreGopher[] = games
        .filter(game => ["Post", "Live"].includes(game.matchMode))
        .map(
          (game): IPreGopher => ({
            description: `${game.homeTeam.name} Vs ${game.awayTeam.name}`,
            handler: game.id,
            type: ItemTypes.Menu
          })
        );

      const gamesNotYetStarted: IPreGopher[] = games
        .filter(game => ["Pre"].includes(game.matchMode))
        .map(
          (game): IPreGopher => ({
            description: `${game.homeTeam.name} Vs ${game.awayTeam.name}`,
            handler: game.id,
            type: ItemTypes.Menu
          })
        );

      return [
        generateGopherInfoMessage("Games Below This Have Started"),
        ...gamesStarted,
        generateEmptyGopherLine(),
        generateGopherInfoMessage("Games Below This Have Not Started"),
        ...gamesNotYetStarted
      ];
    }

    const selectedGame = games.find(g => g.id === message);

    if (!selectedGame) {
      return [
        {
          description: "No Game Found",
          handler: "no-game",
          type: ItemTypes.Error
        }
      ];
    }

    return [
      generateGopherInfoMessage(
        `(H) ${selectedGame.homeTeam.name} - ${selectedGame.homeTeam.score}`
      ),
      generateGopherInfoMessage(
        `(A) ${selectedGame.awayTeam.name} - ${selectedGame.awayTeam.score}`
      ),
      generateEmptyGopherLine(),
      generateGopherInfoMessage(`Venue - ${selectedGame.venue}`),
      generateGopherInfoMessage(
        `Kickoff - ${datefns.format(
          selectedGame.clock.kickOffTime,
          "dddd Do MMM, h:mm a"
        )}`
      ),
      generateGopherInfoMessage(
        `Game Clock - ${selectedGame.clock.currentGameTime}`
      )
    ];
  }

  public async init() {
    await this.fetchNrlGames();
  }
}
