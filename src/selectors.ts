import { Suit, Card, Trick, Hint, GameState, Player, RulesetHintMode, TaskData } from './types';

export function getCaptain(state: GameState): Player {
  const captain = state.players.find(player => player.isCaptain);
  if (!captain) throw new Error('Could not find captain');
  return captain;
}

export function getCaptainId(state: GameState): number {
  return getCaptain(state).id;
}

export function getDealer(state: GameState): Player {
  const dealer = state.players.find(player => player.isDealer);
  if (!dealer) throw new Error('Could not find dealer');
  return dealer;
}

export function getDealerId(state: GameState): number {
  return getDealer(state).id;
}

export function getDealerName(state: GameState): string {
  return getDealer(state).name;
}

export function getPlayerName(state: GameState, playerId: number): string {
  return state.players[playerId].name;
}

export function getPlayerByName(state: GameState, name: string): Player {
  const player = state.players.find(player => player.name === name);
  if (!player) throw new Error('Could not find player from name');
  return player;
}

export function getPlayerByKey(state: GameState, key: string): Player {
  const player = state.players.find(player => player.key === key);
  if (!player) throw new Error('Could not find player from key');
  return player;
}

export function getPlayer(state: GameState, playerId: number): Player {
  const player = state.players[playerId];
  if (!player) throw new Error('Could not find player by id');
  return player;
}

export function getOtherPlayers(state: GameState, playerId: number): Player[] {
  return state.players.filter(player => player.id !== playerId);
}

export function getTaskDataForPlayer(state: GameState, playerId: number, taskId: number): TaskData {
  const player = getPlayer(state, playerId);
  const task = player.tasks?.[taskId];
  if (!task) throw new Error('Could not get task from player data');
  if (!task.data) throw new Error('Task missing required extra data');
  return task.data;
}

export function getUnassignedTasksExist(state: GameState): boolean {
  return !!Object.keys(state.unassignedTasks?.tasks ?? []).length;
}

export function getAreAllTasksAssigned(state: GameState): boolean {
  return (
    !!state.unassignedTasks?.tasks &&
    !!Object.keys(state.unassignedTasks.tasks).length &&
    Object.values(state.unassignedTasks.tasks).every(task => 'provisionalPlayerId' in task) &&
    (!state.unassignedTasks.tasks[94] || !!state.unassignedTasks.tasks[94].data) && // TODO: generalize this
    (!state.unassignedTasks.tasks[95] || !!state.unassignedTasks.tasks[95].data) // TODO: generalize this
  );
}

export function getIsPlayerHost(state: GameState, playerId: number): boolean {
  // host should always be player 0
  return playerId === 0;
}

export function getIsPlayerDealer(state: GameState, playerId: number): boolean {
  return !!state.players[playerId].isDealer;
}

export function getNumberOfPlayers(state: GameState): number {
  return state.players.length;
}

export function getIsGameStarted(state: GameState): boolean {
  return !!state.tricks?.length;
}

export function getIsGameFinished(state: GameState): boolean {
  if (state.timeout) return true;
  if (state.players.some(player => player.tasks && Object.values(player.tasks).some(task => task.failed))) return true;
  const numberOfPlayers = getNumberOfPlayers(state);
  const tricksInGame = Math.floor(40 / numberOfPlayers);
  return (
    !!state.tricks &&
    state.tricks.length === tricksInGame &&
    (state.tricks[tricksInGame - 1].cards ?? []).length === numberOfPlayers
  );
}

export function getAreAllTasksDone(state: GameState): boolean {
  return state.players.every(
    player => !player.tasks || Object.values(player.tasks).every(task => task.done && !task.failed),
  );
}

export function getHintMode(state: GameState): RulesetHintMode {
  return state.ruleset?.hintMode || 'default';
}

export function getAreAllHintsUsed(state: GameState): boolean {
  const hintMode = getHintMode(state);
  const numberOfPlayers = getNumberOfPlayers(state);
  const numberOfHintsUsed = state.players.filter(player => player.hint?.used).length;
  return hintMode === 'fewer' ? numberOfHintsUsed + 2 >= numberOfPlayers : numberOfHintsUsed >= numberOfPlayers;
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

export function getPlayerTricksWon(state: GameState, playerId: number): number {
  if (!state.tricks) {
    return 0;
  }
  return state.tricks.filter(trick => trick.winner === playerId).length;
}

export function getPlayerHint(state: GameState, playerId: number): Hint {
  return state.players[playerId].hint ?? { used: false };
}

export function getPlayerCard(state: GameState, playerId: number, cardIndex: number): Card {
  const hand = getPlayerHand(state, playerId);
  if (cardIndex >= hand.length) throw new Error('Player card out of bounds');
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
  return getCurrentTrick(state).cards![0].suit;
}

export function getPlayerCardsOfSuit(state: GameState, playerId: number, suit: Suit): Card[] {
  const hand = getPlayerHand(state, playerId);
  return hand.filter(card => card.suit === suit);
}

export function getIsCardLegalToPlay(state: GameState, playerId: number, cardIndex: number): boolean {
  const card = getPlayerCard(state, playerId, cardIndex);
  if (getIsBetweenTricks(state)) {
    // TODO: check that no tasks are making the card illegal
    // e.g. "You can only lead with blue or pink"
    return true;
  }
  const ledSuit = getLedSuitForCurrentTrick(state)!;
  return card.suit === ledSuit || getPlayerCardsOfSuit(state, playerId, ledSuit).length === 0;
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
  if (getUnassignedTasksExist(state)) {
    if (getIsPlayerDealer(state, playerId)) {
      return 'Discuss the task cards with your teammates. Press and hold to claim one.\nOnce all tasks are claimed, you may start the game.';
    }
    return `Discuss the task cards with your teammates. Press and hold to claim one.\n${getDealerName(
      state,
    )} will start the game once all tasks are claimed.`;
  }

  if (getIsGameFinished(state)) {
    if (getAreAllTasksDone(state)) {
      return 'Game complete. You won!';
    }
    return 'Game complete. You lost.';
  }

  const nextPlayerId = getNextPlayerId(state);
  if (nextPlayerId === playerId) {
    return 'Choose a card to play';
  }
  return `Waiting for ${getPlayerName(state, nextPlayerId)} to play a card`;
}
