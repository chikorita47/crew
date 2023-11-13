import { Card } from "./types";

export function generateCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += letters[Math.floor(Math.random() * letters.length)];
  }
  return code;
}

export function createDeck(): Card[] {
  return[
    //@ts-ignore
    ...[...Array(9).keys()].map(i => ({ number: i + 1, suit: 'blue' })),
    //@ts-ignore
    ...[...Array(9).keys()].map(i => ({ number: i + 1, suit: 'green' })),
    //@ts-ignore
    ...[...Array(9).keys()].map(i => ({ number: i + 1, suit: 'yellow' })),
    //@ts-ignore
    ...[...Array(9).keys()].map(i => ({ number: i + 1, suit: 'pink' })),
    //@ts-ignore
    ...[...Array(4).keys()].map(i => ({ number: i + 1, suit: 'black' })),
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
  'black': 0,
  'blue': 1,
  'green': 2,
  'yellow': 3,
  'pink': 4,
}
