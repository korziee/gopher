// splits and joins UTF surrogate pairs
export function joinSurrogatePairs(value: string): string {
  return value.split(/[\ufe00-\ufe0f]/).join("");
}

export function getCharacterForRank(rank: string): string {
  switch (rank) {
    case "Ace":
    case "King":
    case "Queen":
    case "Jack": {
      return rank[0];
    }
    default: {
      return rank;
    }
  }
}

export function getCharacterForSuit(suit: string): string {
  switch (suit) {
    case "Spades":
      return "♠︎";
    case "Hearts":
      return "♥︎";
    case "Clubs":
      return "♣︎";
    case "Diamonds":
      return "♦︎";
    default: {
      throw new Error(`Unknown suit: ${suit}`);
    }
  }
}
