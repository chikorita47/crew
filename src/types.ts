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

export type PlayerGoal = {
  id: number;
  done: boolean;
};
export type PlayerGoalList = {
  [key: number]: PlayerGoal;
};

export type UnassignedGoal = {
  id: number;
  provisionalPlayerId: number;
};
export type UnassignedGoalList = {
  [key: number]: UnassignedGoal;
};

export type Player = {
  id: number;
  key: string;
  name: string;
  hand?: Card[];
  hint?: Hint;
  goals?: PlayerGoalList;
  isCaptain?: boolean;
  isDealer?: boolean;
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
  unassignedGoals?: UnassignedGoalList;
  ruleset?: Ruleset;
  timeout?: boolean;
};

export type ProvisionalClientList = { [key: string]: string };
export type ProvisionalGame = {
  host: string;
  clientList: ProvisionalClientList;
};

export type GoalsDataEntryDifficulty = [ number, number, number ];
export type GoalsDataEntry = {
  id: number;
  text: string;
  subtext?: string;
  difficulty: GoalsDataEntryDifficulty;
};

export type GoalsData = {
  [key: string]: GoalsDataEntry;
};
