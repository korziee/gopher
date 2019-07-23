import { INrlMatch, NrlApi } from "nrl-api/compiled/index";
import * as datefns from "date-fns";
import { IGopherServer } from "../../models/GopherServer";
import { IPreGopher } from "../../models/IPreGopher";
import { ItemTypes } from "../../models/ItemTypes";
import { inject, injectable } from "inversify";
import { Symbols } from "../../symbols";
import { IGopherCore } from "../../core";

@injectable()
export class GopherNrlServer implements IGopherServer {
  constructor(@inject(Symbols.GopherCore) private _gopherCore: IGopherCore) {}
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
      this._gopherCore.generateGopherInfoMessage(
        "Games Below This Have Started"
      ),
      ...gamesStarted,
      this._gopherCore.generateEmptyGopherLine(),
      this._gopherCore.generateGopherInfoMessage(
        "Games Below This Have Not Started"
      ),
      ...gamesNotYetStarted
    ];
  }

  private async handleSpecificGame(matchId: string) {
    try {
      const liveGame = await this.NrlApi.getMatchDetails(matchId);
      return [
        this._gopherCore.generateGopherInfoMessage(
          `(H) ${liveGame.homeTeam.nickName} - ${liveGame.homeScore}`
        ),
        this._gopherCore.generateGopherInfoMessage(
          `(A) ${liveGame.awayTeam.nickName} - ${liveGame.awayScore}`
        ),
        this._gopherCore.generateEmptyGopherLine(),
        this._gopherCore.generateGopherInfoMessage(`Venue - ${liveGame.venue}`),
        this._gopherCore.generateGopherInfoMessage(
          `Kickoff - ${datefns.format(
            liveGame.kickOffTime,
            "dddd Do MMM, h:mm a"
          )}`
        ),
        this._gopherCore.generateGopherInfoMessage(
          `Game Clock - ${liveGame.gameSecondsElapsed}`
        )
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
    if (this._gopherCore.isEmptyCRLF(message)) {
      return await this.handleDirectoryListing();
    }

    return await this.handleSpecificGame(message);
  }

  public async init() {}
}
