import { GameState, ProvisionalGame } from './types';

const undoStates: (GameState | ProvisionalGame)[] = [];
let undoCount = 0;
function save(state: GameState | ProvisionalGame) {
  if (undoCount > 0) {
    undoCount--;
    return;
  }
  undoStates.unshift(state);
  if (undoStates.length > 10) {
    undoStates.pop();
  }
}
function undo(): GameState | ProvisionalGame | null {
  undoCount++;
  undoStates.shift();
  return undoStates[0] ?? null;
}

export default { save, undo };
