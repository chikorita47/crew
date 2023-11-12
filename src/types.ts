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

export type UnassignedGoal = {
  id: number;
  proposedPlayerId: number;
};

export type Player = {
  id: number;
  name: string;
  hand?: Card[];
  hint?: Hint;
  goals?: PlayerGoal[];
  isCaptain: boolean;
  isDealer: boolean;
  extraCards: number;
};

export type GameState = {
  players: Player[];
  tricks?: Trick[];
  unassignedGoals?: UnassignedGoal[];
};
