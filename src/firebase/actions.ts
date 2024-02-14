import { ref, set, child, get, push, remove, query, orderByKey, Unsubscribe, onValue } from 'firebase/database';
import db from './db';
import { getPlayerByName } from '../selectors';
import { GameState, ProvisionalGame, ProvisionalClientList } from '../types';
import { generateCode } from '../utilities';

type StateCallback = (state: GameState | ProvisionalGame) => void;
export function subscribeToGame(code: string, callback: StateCallback): Unsubscribe {
  const gameRef = child(child(ref(db), 'games'), code);
  const cleanup = onValue(gameRef, snapshot => {
    callback(snapshot.val());
  });
  return cleanup;
}

export function updateState(newState: GameState | ProvisionalGame, code: string) {
  const gameRef = child(child(ref(db), 'games'), code);
  set(gameRef, newState);
}

export async function createGame(playerName: string): Promise<{ code: string; key: string }> {
  let codeIsValid = false;
  let code = generateCode();

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
  };
  return gameState;
}

export function reportBug(state: GameState, code: string): void {
  updateState(state, `${code}-bug${new Date().getTime()}`);
}
