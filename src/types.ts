export type Suit = 'blue' | 'green' | 'yellow' | 'pink' | 'black'
export type Card = {
  number: number;
  suit: Suit;
};

export type Trick = {
  cards?: Card[];
  winner?: number;
  leader: number;
};

export type HintPlacement = 'top' | 'middle' | 'bottom'
export type Hint = {
  used: boolean;
  card?: Card;
  placement?: HintPlacement;
};

export type PlayerTask = {
  id: number;
  done: boolean;
  failed: boolean;
};
export type PlayerTaskList = {
  [key: number]: PlayerTask;
};

export type UnassignedTask = {
  id: number;
  provisionalPlayerId: number;
};
export type UnassignedTaskList = {
  [key: number]: UnassignedTask;
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

export type RulesetHintMode = 'default' | 'fewer' | 'noTokens';
export type Ruleset = {
  hintMode: RulesetHintMode;
  timeInSeconds?: number;
}

export type GameState = {
  players: Player[];
  tricks?: Trick[];
  unassignedTasks?: UnassignedTaskList;
  ruleset?: Ruleset;
  timeout?: boolean;
};

export type ProvisionalClientList = { [key: string]: string };
export type ProvisionalGame = {
  host: string;
  clientList: ProvisionalClientList;
};

export type TasksDataEntryDifficulty = [ number, number, number ];
export type TasksDataEntry = {
  id: number;
  text: string;
  subtext?: string;
  difficulty: TasksDataEntryDifficulty;
};

export type TasksData = {
  [key: string]: TasksDataEntry;
};
