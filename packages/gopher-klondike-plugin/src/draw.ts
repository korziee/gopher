import { KlondikeGame } from "@korziee/klondike";

import { getCharacterForRank, getCharacterForSuit } from "./util";

export type Grid = Array<string[]>;

function generateGrid(width: number, height: number): Grid {
  return [...Array(height)].map((_, i) => {
    const row = [...Array(width)].map((_, y) => " ");
    return row;
  });
}

function printCardOnGrid(
  gameGrid: Grid,
  card: string,
  xOffset: number,
  yOffset: number
) {
  getCardGrid(card).forEach((rowOfCharacters, row) => {
    rowOfCharacters.forEach((character, characterIndex) => {
      gameGrid[row + yOffset][characterIndex + xOffset] = character;
    });
  });
}

function printStock(
  grid: Grid,
  game: KlondikeGame,
  xOffset: number,
  yOffset: number
) {
  const cardsInStock = game.stock.getCards();

  printCardOnGrid(
    grid,
    cardsInStock.length > 0 ? cardTurnedDown : emptyCell,
    xOffset,
    yOffset
  );
}

function printWaste(
  grid: Grid,
  game: KlondikeGame,
  xOffset: number,
  yOffset: number
) {
  const cardsInWaste = game.waste.getCards();

  if (cardsInWaste.length === 0) {
    printCardOnGrid(grid, emptyCell, xOffset, yOffset);
  } else {
    const card = cardsInWaste[cardsInWaste.length - 1];
    const rank = getCharacterForRank(card.getRank());
    const suit = getCharacterForSuit(card.getSuit());
    const asciiCard = getCard(suit, rank);
    printCardOnGrid(grid, asciiCard, xOffset, yOffset);
  }
}

function printFoundation(
  grid: Grid,
  game: KlondikeGame,
  xOffset: number,
  yOffset: number
) {
  const foundation = game.foundation;

  foundation.getPiles().forEach((pile, i) => {
    const cardsInPile = pile.getCards();

    if (cardsInPile.length === 0) {
      printCardOnGrid(grid, emptyCell, xOffset + i * 10, yOffset);
    } else {
      const card = cardsInPile[cardsInPile.length - 1];
      const rank = getCharacterForRank(card.getRank());
      const suit = getCharacterForSuit(card.getSuit());
      const asciiCard = getCard(suit, rank);

      printCardOnGrid(grid, asciiCard, xOffset + i * 10, yOffset);
    }
  });
}

function printTableau(
  grid: Grid,
  game: KlondikeGame,
  xOffset: number,
  yOffset: number
) {
  game.tableau.getPiles().forEach((pile, pileIndex) => {
    const cards = pile.getCards();

    cards.forEach((card, cardIndexInPile) => {
      const isUpturned = card.getUpturned();

      let cardToPrint: string;

      if (isUpturned) {
        const rank = getCharacterForRank(card.getRank());
        const suit = getCharacterForSuit(card.getSuit());
        const asciiCard = getCard(suit, rank);

        cardToPrint = asciiCard;
      } else {
        cardToPrint = cardTurnedDown;
      }

      printCardOnGrid(
        grid,
        cardToPrint,
        xOffset + pileIndex * 10,
        yOffset + cardIndexInPile * 2
      );
    });
  });
}

function drawBoundary(grid: Grid) {
  // TOOD: refactor this, it's ugly
  grid.forEach((row, rowIndex) => {
    row.forEach((_, itemInRowIndex) => {
      if (rowIndex === 0 && itemInRowIndex === 0) {
        // top corner
        grid[rowIndex][itemInRowIndex] = "┌";
        return;
      }
      if (rowIndex === 0 && itemInRowIndex === row.length - 1) {
        // top right corner
        grid[rowIndex][itemInRowIndex] = "┐";
        return;
      }
      if (rowIndex === grid.length - 1 && itemInRowIndex === 0) {
        // bottom left corner
        grid[rowIndex][itemInRowIndex] = "└";
        return;
      }
      if (rowIndex === grid.length - 1 && itemInRowIndex === row.length - 1) {
        // bottom right corner
        grid[rowIndex][itemInRowIndex] = "┘";
        return;
      }
      if (rowIndex === 0 || rowIndex === grid.length - 1) {
        // top and bottom rows row
        grid[rowIndex][itemInRowIndex] = "-";
        return;
      }
      if (itemInRowIndex === 0 || itemInRowIndex === row.length - 1) {
        // both sides
        grid[rowIndex][itemInRowIndex] = "│";
        return;
      }
      return " ";
    });
  });
}

export function generateGridForGame(game: KlondikeGame): Grid {
  const largestPile = game.tableau.getPiles().reduce((count, pile) => {
    const pileCount = pile.getCards().length;

    return pileCount > count ? pileCount : count;
  }, 0);

  // -1 here because each stacked card is only taking up 2 units, whilst as the face card takes up 6
  const count = (largestPile - 1) * 2 + 6;

  // length is based on longest tableau pile + the length of the top part of the game board
  const grid = generateGrid(73, 9 + count);

  drawBoundary(grid);

  printStock(grid, game, 2, 1);
  printWaste(grid, game, 12, 1);
  printFoundation(grid, game, 32, 1);
  printTableau(grid, game, 2, 8);

  return grid;
}

const cardBase = `
┌───────┐
│ rrs   │
│       │
│       │
│   rrs │
└───────┘
`;

const cardTurnedDown = `
┌───────┐
│ xxxxx │
│ xxxxx │
│ xxxxx │
│ xxxxx │
└───────┘
`;

const emptyCell = `
┌───────┐
│       │
│ empty │
│ empty │
│       │
└───────┘
`;

function getCard(suit: string, rank: string): string {
  let rankPlaceholdersSeen = 0;

  return cardBase
    .split("") // we can split using "" because no UTF surrogate pairs exist in the base
    .map((char) => {
      switch (char) {
        case "s": {
          return suit;
        }
        case "r": {
          // if the rank is a "10" instead of a "K" we need to make sure we space them correctly
          if (rankPlaceholdersSeen === 0 || rankPlaceholdersSeen === 2) {
            rankPlaceholdersSeen += 1;
            return rank.length > 1 ? rank[0] : rank;
          } else {
            rankPlaceholdersSeen += 1;
            return rank.length > 1 ? rank[1] : " ";
          }
        }
        default: {
          return char;
        }
      }
    })
    .join("");
}

function getCardGrid(card: string): Array<Array<string>> {
  return (
    card
      // splits and joins by surrogate pairs so that the final split("") keeps them together
      .split(/[\ufe00-\ufe0f]/)
      .join("")
      .split("\n") // splits into rows
      .filter((s) => s !== "") // remove top and bottom whitespace
      .map((s) => s.split(""))
  );
}
