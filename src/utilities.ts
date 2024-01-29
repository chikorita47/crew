import { Card, Suit } from './types';

export function isCardEqual(from: Card, to: Card): boolean {
  return from.number === to.number && from.suit === to.suit;
}
/**
 * Checks if a card, `from`, has the same values for all the properties of a (partial) card, `to`.
 * If `to` has both `number` and `suit`, this function is equivalent to `isCardEqual`.
 * @param from The card being compared against
 * @param to The (partial) card being checked for similarities
 */
export function isCardSimilar(from: Card, to: Partial<Card>): boolean {
  if (typeof to.number === 'number' && typeof to.suit === 'string')
    return isCardEqual(from, { number: to.number, suit: to.suit });
  // if comparing only a number, black should never be a match
  return (from.number === to.number && from.suit !== Suit.BLACK) || from.suit === to.suit;
}

export function generateCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += letters[Math.floor(Math.random() * letters.length)];
  }
  return code;
}

export function createDeck(): Card[] {
  return [
    //@ts-expect-error no flag needed
    ...[...Array(9).keys()].map(i => ({ number: i + 1, suit: Suit.BLUE })),
    //@ts-expect-error no flag needed
    ...[...Array(9).keys()].map(i => ({ number: i + 1, suit: Suit.GREEN })),
    //@ts-expect-error no flag needed
    ...[...Array(9).keys()].map(i => ({ number: i + 1, suit: Suit.YELLOW })),
    //@ts-expect-error no flag needed
    ...[...Array(9).keys()].map(i => ({ number: i + 1, suit: Suit.PINK })),
    //@ts-expect-error no flag needed
    ...[...Array(4).keys()].map(i => ({ number: i + 1, suit: Suit.BLACK })),
  ] as Card[];
}

export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]];
  }
  return arr;
}

export const SUIT_ORDER = {
  black: 0,
  blue: 1,
  green: 2,
  yellow: 3,
  pink: 4,
};
