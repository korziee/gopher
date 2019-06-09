import { INrlMatch, NrlApi } from "nrl-api/compiled/index";
import * as datefns from "date-fns";
import {
  generateEmptyGopherLine,
  generateGopherInfoMessage,
  isEmptyCRLF
} from "../../core";
import { IGopherServer } from "../../models/GopherServer";
import { IPreGopher } from "../../models/IPreGopher";
import { ItemTypes } from "../../models/ItemTypes";

export class GopherNrlServer implements IGopherServer {
  private NrlApi = new NrlApi();
  /**
   * Fetches nrl games through the nrl-crawler package.
   *
   * Caches games for 10 seconds.
   */
  private async fetchNrlGames(): Promise<INrlMatch[]> {
    const games = await this.NrlApi.getRoundDetails();
    return Object.values(games.matches).flat();
  }

  private async handleDirectoryListing() {
    const games = await this.fetchNrlGames();

    // return list as games.
    const gamesStarted: IPreGopher[] = games
      .filter(game => ["Post", "Live"].includes(game.matchMode))
      .map(
        (game): IPreGopher => ({
          description: `${game.homeTeam.nickName} Vs ${game.awayTeam.nickName}`,
          handler: game.matchId,
          type: ItemTypes.Menu
        })
      );

    const gamesNotYetStarted: IPreGopher[] = games
      .filter(game => ["Pre"].includes(game.matchMode))
      .map(
        (game): IPreGopher => ({
          description: `${game.homeTeam.nickName} Vs ${game.awayTeam.nickName}`,
          handler: game.matchId,
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

  private async handleSpecificGame(matchId: string) {
    try {
      const liveGame = await this.NrlApi.getMatchDetails(matchId);
      return [
        generateGopherInfoMessage(
          `(H) ${liveGame.homeTeam.nickName} - ${liveGame.homeScore}`
        ),
        generateGopherInfoMessage(
          `(A) ${liveGame.awayTeam.nickName} - ${liveGame.awayScore}`
        ),
        generateEmptyGopherLine(),
        generateGopherInfoMessage(`Venue - ${liveGame.venue}`),
        generateGopherInfoMessage(
          `Kickoff - ${datefns.format(
            liveGame.kickOffTime,
            "dddd Do MMM, h:mm a"
          )}`
        ),
        generateGopherInfoMessage(`Game Clock - ${liveGame.gameSecondsElapsed}`)
      ];
    } catch (e) {
      if (!e.message.includes("404")) {
        console.error("unknown error", e);
      }
      return [
        {
          description: "No Game Found",
          handler: "no-game",
          type: ItemTypes.Error
        }
      ];
    }
  }

  public async handleInput(message: string): Promise<IPreGopher[]> {
    if (isEmptyCRLF(message)) {
      return await this.handleDirectoryListing();
    }

    return await this.handleSpecificGame(message);
  }

  public async init() {}
}
