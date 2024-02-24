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
  NONE = 'none',
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
};

export type TasksData = {
  [key: string]: TasksDataEntry;
};

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>;

type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;

// This type assumes that as cards are played, they are added to
export type CardTally = {
  [key in Suit]: key extends 'black' ? Array<IntRange<1, 5>> : Array<IntRange<1, 10>>;
};
export type MaxNumCards = IntRange<1, 6>;

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
