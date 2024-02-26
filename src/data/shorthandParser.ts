import { IntRange, Suit } from '@/types';

export { parse as default };

function getSuitFromShorthand<const S extends SuitLetter>(s: S) {
  if (s === 'B') return Suit.BLUE as const;
  if (s === 'G') return Suit.GREEN as const;
  if (s === 'P') return Suit.PINK as const;
  if (s === 'Y') return Suit.YELLOW as const;
  if (s === 'S') return Suit.BLACK as const;
  throw new Error(`Invalid suit shorthand provided: ${s}`);
}

function parse(cards: ParserArgs[] | ParserArgs, ...args: ParserArgs[]) {
  const arr = Array.isArray(cards) ? cards : [cards, ...args];
  return arr.map(sh => parseCardShorthand(sh));
}

function parseCardShorthand<const T extends ParserArgs>(shorthand: T) {
  // Number-only shorthand
  if (typeof shorthand === 'number') return { number: shorthand } as ParsedOutput<T>;

  // Validate string shorthand
  if (shorthand.length !== 1 && shorthand.length !== 2)
    throw new Error(`Invalid card shorthand provided: ${shorthand}`);

  // Letter-only shorthand
  type CharShorthand<U> = U extends SuitLetter ? U : never;
  if (shorthand === 'B' || shorthand === 'G' || shorthand === 'P' || shorthand === 'Y' || shorthand === 'S')
    return { suit: getSuitFromShorthand(shorthand) as SuitMap<CharShorthand<T>> } as ParsedOutput<T>;

  // Full shorthand
  type FullShorthand<U> = U extends CardShorthand ? U : never;
  const suitLetter = shorthand[0] as FirstChar<FullShorthand<T>>;
  const number = Number(shorthand[1] as SecondChar<FullShorthand<T>>) as MapStringToNumber<
    SecondChar<FullShorthand<T>>
  >;
  const suit = getSuitFromShorthand(suitLetter) as SuitMap<typeof suitLetter>;
  return { suit, number } as ParsedOutput<FullShorthand<T>>;
}

type ColorSuitLetter = 'B' | 'G' | 'P' | 'Y';
export type SuitLetter = ColorSuitLetter | 'S';
export type CardShorthand = `${ColorSuitLetter}${IntRange<1, 10>}` | `S${IntRange<1, 5>}`;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type FirstChar<T extends CardShorthand> = T extends `${infer first}${infer _rest}` ? first : never;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type SecondChar<T extends CardShorthand> = T extends `${infer _first}${infer second}${infer _rest}` ? second : never;
type SuitMap<S extends SuitLetter> = S extends 'B'
  ? Suit.BLUE
  : S extends 'G'
    ? Suit.GREEN
    : S extends 'P'
      ? Suit.PINK
      : S extends 'S'
        ? Suit.BLACK
        : S extends 'Y'
          ? Suit.YELLOW
          : never;
type ParserArgs = CardShorthand | number | SuitLetter;
type ParsedOutput<T extends ParserArgs> = T extends CardShorthand
  ? { suit: SuitMap<FirstChar<T>>; number: MapStringToNumber<SecondChar<T>> }
  : T extends number
    ? { number: T }
    : T extends SuitLetter
      ? { suit: SuitMap<T> }
      : never;
type MapStringToNumber<T extends `${IntRange<1, 10>}`> = T extends '1'
  ? 1
  : T extends '2'
    ? 2
    : T extends '3'
      ? 3
      : T extends '4'
        ? 4
        : T extends '5'
          ? 5
          : T extends '6'
            ? 6
            : T extends '7'
              ? 7
              : T extends '8'
                ? 8
                : T extends '9'
                  ? 9
                  : never;
