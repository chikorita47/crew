import { Suit, Card, Trick, Hint, GameState, Player } from './types';

export function getCaptainId(state: GameState): number {
  const captain = state.players.find(player => player.isCaptain);
  if (!captain) throw new Error('Could not find captain');
  return captain.id;
}

export function getDealerName(state: GameState): string {
  const dealer = state.players.find(player => player.isDealer);
  if (!dealer) throw new Error('Could not find dealer');
  return dealer.name;
}

export function getPlayerName(state: GameState, playerId: number): string {
  return state.players[playerId].name;
}

export function getPlayerByName(state: GameState, name: string): Player {
  const player = state.players.find(player => player.name === name);
  if (!player) throw new Error('Could not find player from name');
  return player;
}

export function getUnassignedGoalsExist(state: GameState): boolean {
  return !!Object.keys(state.unassignedGoals ?? []).length;
}

export function getAreAllGoalsAssigned(state: GameState): boolean {
  return !!state.unassignedGoals && !!Object.keys(state.unassignedGoals).length && !Object.values(state.unassignedGoals).some(goal => !('provisionalPlayerId' in goal));
}

export function getIsPlayerDealer(state: GameState, playerId: number): boolean {
  return !!state.players[playerId].isDealer;
}

export function getNumberOfPlayers(state: GameState): number {
  return state.players.length;
}

export function getIsGameStarted(state: GameState): boolean {
  return !(state.tricks?.length);
}

export function getIsGameFinished(state: GameState): boolean {
  if (state.timeout) return true;
  const numberOfPlayers = getNumberOfPlayers(state);
  const tricksInGame = Math.floor(40 / numberOfPlayers);
  return !!state.tricks && state.tricks.length === tricksInGame && (state.tricks[tricksInGame - 1].cards ?? []).length === numberOfPlayers;
}

export function getAreAllGoalsDone(state: GameState): boolean {
  return !state.players.find(player => player.goals && Object.values(player.goals).find(goal => !goal.done));
}

export function getCurrentTrickId(state: GameState): number {
  if (!state.tricks) {
    return 0;
  }
  return state.tricks.length - 1;
}

export function getCurrentTrick(state: GameState): Trick {
  const emptyTrick = { leader: getCaptainId(state) };
  if (!state.tricks) {
    return emptyTrick;
  }
  return state.tricks[getCurrentTrickId(state)] ?? emptyTrick;
}

export function getIsBetweenTricks(state: GameState): boolean {
  const currentTrick = getCurrentTrick(state);
  const numberOfPlayers = getNumberOfPlayers(state);
  return !currentTrick.cards || currentTrick.cards.length === 0 || currentTrick.cards.length === numberOfPlayers;
}

export function getPlayerHint(state: GameState, playerId: number): Hint {
  return state.players[playerId].hint ?? { used: false };
}

export function getPlayerCard(state: GameState, playerId: number, cardIndex: number): Card {
  const hand = getPlayerHand(state, playerId);
  return hand[cardIndex];
}

export function getPlayerHand(state: GameState, playerId: number): Card[] {
  const hand = state.players[playerId].hand;
  if (!hand) throw new Error(`Could not find hand for player ${playerId}`);
  return hand;
}

export function getLedSuitForCurrentTrick(state: GameState): Suit | null {
  if (getIsBetweenTricks(state)) {
    return null;
  }
  return getCurrentTrick(state).cards!![0].suit;
}

export function getPlayerCardsOfSuit(state: GameState, playerId: number, suit: Suit): Card[] {
  const hand = getPlayerHand(state, playerId);
  return hand.filter(card => card.suit === suit);
}

export function getNextPlayerId(state: GameState): number {
  if (!state.tricks || !state.tricks.length) {
    return getCaptainId(state);
  }
  const currentTrick = getCurrentTrick(state);
  const numberOfPlayers = getNumberOfPlayers(state);
  if (currentTrick.cards && currentTrick.cards.length === numberOfPlayers) {
    if (currentTrick.winner === undefined) throw new Error('Finished trick should have a winner');
    return currentTrick.winner;
  }
  return (currentTrick.leader + (currentTrick.cards ? currentTrick.cards.length : 0)) % numberOfPlayers;
}

export function getStatusText(state: GameState, playerId: number): string {
  if (getUnassignedGoalsExist(state)) {
    if (getIsPlayerDealer(state, playerId)) {
      return `Discuss the goal cards with your teammates. Press and hold to claim one.\nOnce all goals are claimed, you may start the game.`;
    }
    return `Discuss the goal cards with your teammates. Press and hold to claim one.\n${getDealerName(state)} will start the game once all goals are claimed.`;
  }

  if (getIsGameFinished(state)) {
    if (getAreAllGoalsDone(state)) {
      return `Game complete. You won!`
    }
    return `Game complete. You lost.`
  }

  const nextPlayerId = getNextPlayerId(state);
  if (nextPlayerId === playerId) {
    return `Choose a card to play`;
  }
  return `Waiting for ${getPlayerName(state, nextPlayerId)} to play a card`;
}
