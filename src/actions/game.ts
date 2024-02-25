import { getUnassignedTasksExist, getAreAllTasksAssigned, getNextDealerId } from '../selectors';
import { GameState, Ruleset, UnassignedTaskList, Suit } from '../types';
import { SUIT_ORDER, createDeck, shuffle } from '../utilities';

import { dealTasks } from './tasks';
import { removePlayerTasks } from './utilities';

/**
 * Deals player hands from a shuffled deck, resets tricks and timeout state.
 */
export function dealPlayerHands(state: GameState, dealerId: number): GameState {
  const newState = structuredClone(state);

  const cards = shuffle(createDeck());

  const players = newState.players;
  for (const player of players) {
    player.hand = [];
    player.hint = { used: false };
    player.isCaptain = false;
    player.isDealer = player.id === dealerId;
  }
  const numberOfPlayers = players.length;
  for (let i = 0; i < cards.length; i++) {
    const player = (i + dealerId + 1) % numberOfPlayers;
    const card = cards[i];
    players[player].hand!.push(card);
    if (card.number === 4 && card.suit === Suit.BLACK) {
      players[player].isCaptain = true;
    }
  }
  const minHandSize = Math.min(...players.map(player => player.hand!.length));
  for (const player of players) {
    player.extraCards = player.hand!.length - minHandSize;
    // sort player's hand
    player.hand = player.hand!.sort((a, b) => {
      if (a.suit !== b.suit) {
        return SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit];
      }
      return b.number - a.number;
    });
  }

  newState.tricks = [];
  newState.timeout = false;

  return newState;
}

/**
 * Moves all tasks from `unassignedTasks` to player objects to start game.
 */
export function finalizeTasks(state: GameState): GameState {
  if (!getUnassignedTasksExist(state)) {
    throw new Error('Cannot begin a game that has already started, or with no tasks');
  }
  if (!getAreAllTasksAssigned(state)) {
    throw new Error('Cannot begin game before all tasks are assigned');
  }

  const { unassignedTasks, ...newState } = structuredClone(state);
  for (const task of Object.values(unassignedTasks!.tasks)) {
    const playerId = task.provisionalPlayerId!;
    if (!newState.players[playerId]) throw new Error('Cannot assign task to nonexistent player');
    if (!newState.players[playerId].tasks) {
      newState.players[playerId].tasks = {};
    }
    newState.players[playerId].tasks![task.id] = {
      id: task.id,
      done: false,
      failed: false,
    };
    if (task.data) {
      newState.players[playerId].tasks![task.id].data = task.data;
    }
  }

  return newState;
}

/**
 * Sets the `ruleset` on the game state.
 */
export function setRuleset(state: GameState, ruleset: Ruleset): GameState {
  const newState = structuredClone(state);
  newState.ruleset = ruleset;
  return newState;
}

/**
 * Starts a new game with the existing players; deals tasks for the given `difficulty`,
 * deals players' hands, and resets game state.
 */
export function dealNewGame(state: GameState, difficulty: number, dealerId: number) {
  return dealPlayerHands(dealTasks(removePlayerTasks(state), difficulty), dealerId);
}

const LOGBOOK_NUMBER_TO_TASK_ID = {
  8: 100,
  12: 101,
  21: 102,
  23: 103,
  27: 104,
} as { [key: number]: number };
/**
 * Starts a new game using a special task (or set of tasks) for a specific logbook game.
 * For `logbookNumber`s other than 32, assigns the task to the host.
 */
export function dealNewGameSpecial(state: GameState, logbookNumber: number, dealerId: number) {
  const newState = removePlayerTasks(state);
  if (logbookNumber === 32) {
    newState.unassignedTasks = {
      order: [3, 4, 38, 73],
      tasks: {
        3: { id: 3 },
        4: { id: 4 },
        38: { id: 38 },
        73: { id: 73 },
      },
    };
  } else {
    if (!(logbookNumber in LOGBOOK_NUMBER_TO_TASK_ID)) {
      throw new Error('Could not start special game with invalid logbook number');
    }
    const taskId = LOGBOOK_NUMBER_TO_TASK_ID[logbookNumber];
    newState.players[0].tasks = {
      [taskId]: {
        id: taskId,
        done: false,
        failed: false,
      },
    };
  }
  return dealPlayerHands(newState, dealerId);
}

/**
 * Starts a new game with the existing players and the same tasks. Deals a new hand to players
 * and resets game state.
 */
export function retryGame(state: GameState): GameState {
  const newState = structuredClone(state);

  // recreate unassignedTasks
  const tasks: UnassignedTaskList = {};
  for (const player of newState.players) {
    if (player.tasks) {
      for (const taskId in player.tasks) {
        tasks[taskId] = { id: ~~taskId };
      }
    }
  }
  newState.unassignedTasks = {
    order: Object.keys(tasks).map(taskId => ~~taskId),
    tasks,
  };

  // reset state and re-deal
  return dealPlayerHands(removePlayerTasks(newState), getNextDealerId(state));
}
