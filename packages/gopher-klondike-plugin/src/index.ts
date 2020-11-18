import {
  GopherItem,
  GopherItemTypes,
  GopherPlugin,
  isNewLine,
} from "@korziee/gopher";
import { KlondikeGame, Move } from "@korziee/klondike";
import { v4 as uuid } from "uuid";

import {
  joinSurrogatePairs,
  getCharacterForRank,
  getCharacterForSuit,
} from "./util";
import { generateGridForGame, Grid } from "./draw";
import { GameAction } from "./types";

/**
 * Top Level Menu:
 * - Start Game
 *  - server generates a GUID, store in memory, this will be used to track the session
 *  - server responds with the game table/board and the following options (each option should be prepended with the game GUID)
 *    - draw a card
 *    - every single possible move as a gopher directory
 *    - option to restart the current game (is this possible?)
 *    - option to undo
 * - NON MVP: Continue Game (needs to provide a key)
 *
 * Improvements
 *  - Top level game title (centred) - done
 *  - Space between the game board and the moves - done
 *  - Think of a better naming scheme for the moves - done
 *  - Create top level menu that explains the game and where users can find out more information -doneish
 *    - also include the fact that it was tested using a mono spaced font and Gophie! -done
 *  - Separate Menus - done
 *    - Draw (not a menu)
 *    - Moves (waste)
 *    - Moves (tableau)
 *    - Moves (foundation)
 *    - Options
 *      - Undo
 *      - Restart Game - done
 *
 */

export class KlondikeGopherPlugin implements GopherPlugin {
  selector = "klondike";
  descriptionShort = "A klondike/solitaire game for Gopher!";

  private games: { [key: string]: KlondikeGame } = {};

  public async init() {}

  public async handleSelector(
    selector: string
  ): Promise<string | GopherItem[]> {
    if (isNewLine(selector)) {
      // root listing
      return [
        GopherItem.generateInfoItem("Welcome to the Klondike GopherPlugin."),
        GopherItem.generateInfoItem(
          "This plugin provides you with the ability to play solitaire/klondike over Gopher."
        ),
        GopherItem.generateEmptyItem(),
        GopherItem.generateInfoItem(
          "This was tested using the Gophie Gopher browser using a monospaced font"
        ),
        GopherItem.generateEmptyItem(),
        new GopherItem(GopherItemTypes.Menu, "START GAME", "start-game"),
      ];
    }

    if (selector === "start-game") {
      let guid = uuid();
      this.games[guid] = new KlondikeGame();

      return this.handleExistingGame(guid, GameAction.Start, "");
    }

    if (selector.includes("game")) {
      const [, id, action, actionId] = selector.split("/");

      return this.handleExistingGame(id, action as GameAction, actionId);
    }

    return "";
  }

  private async handleGameAction(
    game: KlondikeGame,
    action: GameAction,
    actionId?: string
  ) {
    switch (action) {
      case GameAction.Start:
        game.deal();
        game.draw();

        break;
      case GameAction.Draw:
        game.draw();

        break;
      case GameAction.Move:
        if (!actionId) {
          throw new Error("Action ID required for move");
        }

        const move = game.getAvailableMoves()[parseInt(actionId, 10)];
        game.makeMove(move);

        break;
      case GameAction.Restart:
        while (game.undo()) {}

        break;
      case GameAction.Undo:
        game.undo();

        break;
      default:
        throw new Error(`unknown game action ${action}`);
    }
  }

  private async handleExistingGame(
    gameId: string,
    action: GameAction,
    actionId: string
  ): Promise<GopherItem[]> {
    const game = this.games[gameId];

    this.handleGameAction(game, action, actionId);

    const gopher: GopherItem[] = [];

    // add the game board to the gopher response
    gopher.push(...this.generateGopherHeader());
    gopher.push(GopherItem.generateEmptyItem());
    gopher.push(...this.transformGridToGopher(generateGridForGame(game)));
    gopher.push(GopherItem.generateEmptyItem());
    gopher.push(...this.getMovesForGame(game, gameId));
    gopher.push(GopherItem.generateEmptyItem());
    gopher.push(...this.getGameOptions(game, gameId));

    return gopher;
  }

  private createGopherItemForMove(
    move: Move,
    gameId: string,
    moveId: string
  ): GopherItem {
    let description;

    if (move.cards.length > 1) {
      const firstCard = move.cards[0];
      const lastCard = move.cards[move.cards.length - 1];

      description = `${getCharacterForRank(
        firstCard.getRank()
      )}${getCharacterForSuit(firstCard.getSuit())} (pile:${
        move.meta?.fromPile
      }) >>> ${getCharacterForRank(lastCard.getRank())}${getCharacterForSuit(
        lastCard.getSuit()
      )} (pile:${move.meta?.toPile})`;
    } else {
      const card = move.cards[0];

      let moveInfo: string = "";

      if (move.from === "tableau") {
        moveInfo += `(${move.meta?.fromPile})`;
      }

      if (move.to === "tableau") {
        moveInfo += ` >>> tableau (${move.meta?.toPile})`;
      }

      if (move.to === "foundation") {
        moveInfo += ` >>> foundation`;
      }

      description = `${getCharacterForRank(
        card.getRank()
      )}${getCharacterForSuit(card.getSuit())} ${moveInfo}`;
    }

    return new GopherItem(
      GopherItemTypes.Menu,
      joinSurrogatePairs(description),
      `game/${gameId}/move/${moveId}`
    );
  }

  private getMovesForGame(game: KlondikeGame, gameId: string): GopherItem[] {
    const moves = game.getAvailableMoves();
    const canDrawCard = game.canDrawCard();
    const gopher: GopherItem[] = [];

    gopher.push(
      GopherItem.generateInfoItem(
        "\\\\----------------------------//  Moves  \\\\---------------------------//"
      )
    );
    gopher.push(GopherItem.generateEmptyItem());

    if (moves.length === 0 && !canDrawCard) {
      gopher.push(
        new GopherItem(
          GopherItemTypes.Info,
          "Bugger, there aren't any more moves!"
        )
      );

      return gopher;
    }

    const tableauMoves: GopherItem[] = [];
    const foundationMoves: GopherItem[] = [];
    const wasteMoves: GopherItem[] = [];

    moves.forEach((move, i) => {
      const gopherItemForMove = this.createGopherItemForMove(
        move,
        gameId,
        i.toString()
      );

      switch (move.from) {
        case "foundation":
          foundationMoves.push(gopherItemForMove);
          break;
        case "tableau":
          tableauMoves.push(gopherItemForMove);
          break;
        case "waste":
          wasteMoves.push(gopherItemForMove);
          break;
        default:
          break;
      }
    });

    if (game.canDrawCard()) {
      gopher.push(GopherItem.generateInfoItem("Stock (moves)"));
      gopher.push(
        new GopherItem(GopherItemTypes.Menu, "Draw", `game/${gameId}/draw`)
      );
    }

    if (tableauMoves.length) {
      gopher.push(GopherItem.generateInfoItem("Tableau (moves)"));
      gopher.push(...tableauMoves);
    }

    if (wasteMoves.length) {
      gopher.push(GopherItem.generateInfoItem("Waste (moves)"));
      gopher.push(...wasteMoves);
    }

    if (foundationMoves.length) {
      gopher.push(GopherItem.generateInfoItem("Foundation (moves)"));
      gopher.push(...foundationMoves);
    }

    return gopher;
  }

  private getGameOptions(game: KlondikeGame, gameId: string): GopherItem[] {
    return [
      GopherItem.generateInfoItem(
        "\\\\----------------------------//  Options  \\\\---------------------------//"
      ),
      GopherItem.generateEmptyItem(),
      new GopherItem(GopherItemTypes.Menu, "Restart", `game/${gameId}/restart`),
      new GopherItem(GopherItemTypes.Menu, "Start New Game", "start-game"),
      new GopherItem(GopherItemTypes.Menu, "Undo", `game/${gameId}/undo`),
    ];
  }

  private transformGridToGopher(grid: Grid): GopherItem[] {
    return grid.map((row) => {
      return new GopherItem(GopherItemTypes.Info, row.join(""));
    });
  }

  private generateGopherHeader(): GopherItem[] {
    return [
      GopherItem.generateInfoItem(
        "\\\\---------------------------//  Klondike  \\\\--------------------------//"
      ),
    ];
  }
}
