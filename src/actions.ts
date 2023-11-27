import { ref, set, child, get, push, remove, query, orderByKey } from 'firebase/database';
import { TASKS_DATA } from './data';
import db from './firebase';
import {
  getNextPlayerId,
  getPlayerName,
  getPlayerCard,
  getIsBetweenTricks,
  getPlayerCardsOfSuit,
  getCurrentTrick,
  getNumberOfPlayers,
  getCurrentTrickId,
  getPlayerHint,
  getPlayerByName,
  getIsGameStarted,
  getIsGameFinished,
  getUnassignedTasksExist,
  getAreAllTasksAssigned,
  getIsCardLegalToPlay,
} from './selectors';
import { HintPlacement, GameState, ProvisionalGame, ProvisionalClientList, Ruleset, UnassignedTaskList, Trick } from './types';
import { SUIT_ORDER, createDeck, generateCode, shuffle } from './utilities';

const DUMMY_GAME = 'AAAA';

function updateState(newState: GameState | ProvisionalGame, code: string) {
  const gameRef = child(child(ref(db), 'games'), code);
  set(gameRef, newState);
}

export async function createGame(playerName: string): Promise<{ code: string, key: string }> {
  let codeIsValid = false;
  let code = generateCode();;

  while (!codeIsValid) {
    const gameRef = child(child(ref(db), 'games'), code);
    const snapshot = await get(gameRef);
    if (snapshot.exists()) {
      code = generateCode();
    } else {
      codeIsValid = true;
    }
  }

  const newGame: ProvisionalGame = {
    host: playerName,
    clientList: {},
  };
  updateState(newGame, code);

  const clientListRef = child(child(child(ref(db), 'games'), code), 'clientList');
  const { key } = push(clientListRef, playerName);
  if (!key) throw new Error('Failed to join game. Please try again.');
  return { code, key };
}

export async function joinGame(playerName: string, code: string): Promise<string> {
  const gameRef = child(child(ref(db), 'games'), code);
  const snapshot = await get(gameRef);
  if (!snapshot.exists()) {
    throw new Error(`Game ${code} does not exist`);
  }

  const game: ProvisionalGame | GameState = snapshot.val();
  if ('players' in game) {
    const player = getPlayerByName(game, playerName);
    return player.key;
  }

  if (Object.values(game.clientList).includes(playerName)) {
    throw new Error('Please choose a different name, this one is already taken');
  }
  const clientListRef = child(gameRef, 'clientList');
  const { key } = push(clientListRef, playerName);
  if (!key) throw new Error('Failed to join game. Please try again.');
  return key;
}

export function removeProvisionalPlayer(key: string, code: string): void {
  const gameRef = child(child(ref(db), 'games'), code);
  remove(child(child(gameRef, 'clientList'), key));
}

export async function startGame(code: string): Promise<GameState> {
  const gameRef = child(child(ref(db), 'games'), code);
  const snapshot = await get(query(child(gameRef, 'clientList'), orderByKey()));
  if (!snapshot.exists()) {
    throw new Error(`Provisional game ${code} does not exist`);
  }

  const clientList: ProvisionalClientList = snapshot.val();
  if (Object.keys(clientList).length < 3) throw new Error('Cannot play with fewer than 3 people');
  if (Object.keys(clientList).length > 5) throw new Error('Cannot play with more than 5 people');
  const gameState: GameState = {
    players: Object.entries(clientList).map(([key, name], index) => ({
      id: index,
      name,
      key,
    })),
  }
  updateState(gameState, code);
  return gameState
}

export function dealTasks(state: GameState, difficulty: number): GameState {
  const numberOfPlayers = getNumberOfPlayers(state);

  const allTasks = shuffle(Object.keys(TASKS_DATA)); // TODO: do this elsewhere
  const tasksToUse = [];
  const skippedTasks = [];
  let difficultyCounter = 0;
  while (difficultyCounter < difficulty) {
    const newTaskId = allTasks.shift();
    if (!newTaskId) throw new Error('Failed to reach difficulty');
    const newTaskDifficulty = TASKS_DATA[newTaskId].difficulty[numberOfPlayers - 3];
    if (difficultyCounter + newTaskDifficulty > difficulty) {
      skippedTasks.push(newTaskId);
    } else {
      tasksToUse.push(newTaskId);
      difficultyCounter += newTaskDifficulty;
    }
  }

  const leftoverTasks = skippedTasks.concat(allTasks); // TODO: save this

  const newState = structuredClone(state);
  
  newState.unassignedTasks = tasksToUse.reduce((acc, taskId) => ({
    ...acc,
    [taskId]: {
      id: taskId,
    },
  }), {} as UnassignedTaskList);

  return newState;
}

export function claimTask(state: GameState, playerId: number, taskId: number): GameState {
  const newState = structuredClone(state);
  if (!newState.unassignedTasks?.[taskId]) throw new Error('Cannot claim task that is not in the game');
  newState.unassignedTasks[taskId].provisionalPlayerId = playerId;
  return newState;
}

export function kickTask(state: GameState, taskId: number): GameState {
  throw new Error ('Not yet implemented');
}

export function finalizeTasksAndRuleset(state: GameState, ruleset: Ruleset): GameState {
  if (!getUnassignedTasksExist(state)) {
    throw new Error('Cannot begin a game that has already started, or with no tasks');
  }
  if (!getAreAllTasksAssigned(state)) {
    throw new Error('Cannot begin game before all tasks are assigned');
  }

  const { unassignedTasks, ...newState } = structuredClone(state);
  for (const task of Object.values(unassignedTasks!!)) {
    const playerId = task.provisionalPlayerId;
    if (!newState.players[playerId]) throw new Error('Cannot assign task to nonexistent player');
    if (!newState.players[playerId].tasks) {
      newState.players[playerId].tasks = {};
    }
    newState.players[playerId].tasks!![task.id] = {
      id: task.id,
      done: false,
      failed: false,
    };
  }

  newState.ruleset = ruleset;

  return newState;
}

export function computeWinner(trick: Trick, numberOfPlayers: number) {
  if (!trick.cards || (trick.cards.length !== numberOfPlayers)) {
    throw new Error('Trick is not completed, cannot compute winner');
  }
  let highestBlackPos: number | null = null;
  let highestLedPos = 0;
  trick.cards.forEach((trickCard, index, cards) => {
    if (trickCard.suit === 'black' && (highestBlackPos === null || cards[highestBlackPos].number < trickCard.number)) {
      highestBlackPos = index;
    }
    if (highestBlackPos === null && trickCard.suit === cards[0].suit && cards[highestLedPos].number < trickCard.number) {
      highestLedPos = index;
    }
  });
  const winningPos = highestBlackPos !== null ? highestBlackPos : highestLedPos;
  return (winningPos + trick.leader) % numberOfPlayers;
}

export function playCard(state: GameState, playerId: number, cardIndex: number): GameState {
  if (getNextPlayerId(state) !== playerId) {
    throw new Error(`${getPlayerName(state, playerId)} is trying to play out of turn`);
  }

  const newState = structuredClone(state);

  if (!getIsCardLegalToPlay(state, playerId, cardIndex)) {
    throw new Error('You must follow suit');
  }

  const card = getPlayerCard(state, playerId, cardIndex);
  // remove card from hand
  newState.players[playerId].hand!!.splice(cardIndex, 1);
  // and from hint, if it's there
  const hint = newState.players[playerId].hint;
  if (hint && hint.card && hint.card.number === card.number && hint.card.suit == card.suit) {
    newState.players[playerId].hint = { used: true };
  }

  if (!newState.tricks) {
    newState.tricks = [];
  }
  const latestTrick = getCurrentTrick(state);
  const numberOfPlayers = getNumberOfPlayers(state);

  if (latestTrick.cards && latestTrick.cards.length === numberOfPlayers) {
    const newTrick = {
      leader: playerId,
      cards: [card],
    };
    newState.tricks!!.push(newTrick);
  } else {
    const updatedTrick = {
      ...latestTrick,
      cards: [...latestTrick.cards || [], card],
    };
    if (updatedTrick.cards.length === numberOfPlayers) {
      updatedTrick.winner = computeWinner(updatedTrick, numberOfPlayers);
      // TODO: compute if any tasks have been completed
    }
    newState.tricks!![getCurrentTrickId(state)] = updatedTrick;
  }

  return newState;
}

export function getHintPlacement(state: GameState, playerId: number, cardIndex: number): HintPlacement {
  const hintCard = getPlayerCard(state, playerId, cardIndex);
  if (hintCard.suit === 'black') throw new Error('Cannot give a hint about a black card');
  const cardsOfHintSuit = getPlayerCardsOfSuit(state, playerId, hintCard.suit).map(card => card.number);
  const highestNumberOfHintSuit = Math.max(...cardsOfHintSuit);
  const lowestNumberOfHintSuit = Math.min(...cardsOfHintSuit);
  if (hintCard.number === highestNumberOfHintSuit && hintCard.number === lowestNumberOfHintSuit) {
    return 'middle';
  } else if (hintCard.number === highestNumberOfHintSuit) {
    return 'top';
  } else if (hintCard.number === lowestNumberOfHintSuit) {
    return 'bottom';
  }
  throw new Error('Cannot give a hint about this card');
}

export function giveHint(state: GameState, playerId: number, cardIndex: number): GameState {
  if (!getIsBetweenTricks(state)) {
    throw new Error('Cannot give a hint during a trick');
  }

  const playerHint = getPlayerHint(state, playerId);
  if (playerHint.used) {
    throw new Error('Cannot give multiple hints in one game');
  }

  const card = getPlayerCard(state, playerId, cardIndex);
  const placement = getHintPlacement(state, playerId, cardIndex);

  const newState = structuredClone(state);
  newState.players[playerId].hint = {
    used: true,
    card,
    placement,
  }

  return newState;
}

export function toggleTaskDone(state: GameState, playerId: number, taskId: number): GameState {
  const newState = structuredClone(state);
  if (!newState.players[playerId].tasks?.[taskId]) throw new Error(`Player does not have task ${taskId}`);
  newState.players[playerId].tasks!![taskId].done = !newState.players[playerId].tasks!![taskId].done;
  return newState;
}

export function deal(state: GameState, dealerId: number): GameState {
  if (getIsGameStarted(state) && !getIsGameFinished(state)) {
    throw new Error('Game is in progress');
  }

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
    players[player].hand!!.push(card);
    if (card.number === 4 && card.suit === 'black') {
      players[player].isCaptain = true;
    }
  }
  const minHandSize = Math.min(...players.map(player => player.hand!!.length));
  for (const player of players) {
    player.extraCards = player.hand!!.length - minHandSize;
    // sort player's hand
    player.hand = player.hand!!.sort((a, b) => {
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
