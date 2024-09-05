import type { CardShorthand, SuitLetter } from './data/shorthandParser';

export enum Suit {
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  PINK = 'pink',
  BLACK = 'black',
}
export type Card = {
  number: number;
  suit: Suit;
};

export type Trick = {
  cards?: Card[];
  winner?: number;
  leader: number;
};

export enum HintPlacement {
  TOP = 'top',
  MIDDLE = 'middle',
  BOTTOM = 'bottom',
}
export type Hint = {
  used: boolean;
  card?: Card;
  placement?: HintPlacement;
};

export type TaskData = { [key: string]: string | number };
export type PlayerTask = {
  id: number;
  done: boolean;
  failed: boolean;
  data?: TaskData;
};
export type PlayerTaskList = {
  [key: number]: PlayerTask;
};

export type UnassignedTask = {
  id: number;
  provisionalPlayerId?: number;
  data?: TaskData;
};
export type UnassignedTaskList = {
  [key: number]: UnassignedTask;
};
export type UnassignedTasksData = {
  tasks: UnassignedTaskList;
  order: number[];
};

export type Player = {
  id: number;
  key: string;
  name: string;
  hand?: Card[];
  hint?: Hint;
  tasks?: PlayerTaskList;
  isCaptain?: boolean;
  isDealer?: boolean;
  isHost?: boolean;
  extraCards?: number;
};

export enum RulesetHintMode {
  DEFAULT = 'default',
  FEWER = 'fewer',
  NO_TOKENS = 'noTokens',
}
export type Ruleset = {
  hintMode: RulesetHintMode;
  timeInSeconds?: number;
};

export type GameState = {
  players: Player[];
  tricks?: Trick[];
  unassignedTasks?: UnassignedTasksData;
  leftoverTasks?: number[];
  difficulty?: number;
  ruleset?: Ruleset;
  timeout?: boolean;
};

export type ProvisionalClientList = { [key: string]: string };
export type ProvisionalGame = {
  host: string;
  clientList: ProvisionalClientList;
};

export type TasksDataEntryDifficulty = [number, number, number];
export type TasksDataEntryTest = (state: GameState, owner: number) => TaskState;
export type TasksDataEntry = {
  id: number;
  text: string;
  subtext?: string;
  difficulty: TasksDataEntryDifficulty;
  requiresExtraData?: boolean;
  test: TasksDataEntryTest;
  layout: TaskLayout;
  redealSets?: number[][];
};
type CardLayoutType = 'fan' | 'cluster' | 'side-by-side' | 'big-small';
type TaskLayoutType = 'bottom-image' | 'inline-image' | 'no-image' | 'two-by-two';
type TaskLayout = {
  type: TaskLayoutType;
  cards?: Array<CardShorthand | number | SuitLetter>;
  cardLayout?: CardLayoutType;

  /** Array containing the quantity tag(s) or top text for the `cards`.
   *  Provide a `number` for the quantity tag, or a `string` for the top text.
   *  The array must have the same length as `cards`, as
   *  the extras will apply to the card with a matching index.
   *
   *  @example
   *  const layout = {
   *   cards: ['P', 'Y', 'B'],
   *   cardExtras: ['or', '', 'or']
   *  }
   */
  cardExtras?: number[] | string[];
  value?: number | number[];
  playerComparison?: 'more' | 'more-combined' | 'fewer';
};

export type TasksData = {
  [key: string]: TasksDataEntry;
};

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>;

export type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;

// This type assumes that as cards are played, they are added to
export type CardTally = {
  [key in Suit]: key extends 'black' ? Array<IntRange<1, 5>> : Array<IntRange<1, 10>>;
};
export type MaxNumCards = IntRange<1, 6>;
export type SuitNumber<T extends Suit = Suit.BLUE> = T extends Suit.BLACK ? IntRange<1, 5> : IntRange<1, 10>;

export enum Comparison {
  FEWER_THAN = -1,
  EQUAL_TO,
  MORE_THAN,
}
export enum TaskState {
  FAILURE = -1,
  PENDING,
  SUCCESS,
}
