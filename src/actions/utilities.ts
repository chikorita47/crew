import { TASKS_DATA } from '../data';
import { GameState, Suit, TaskState, Trick } from '../types';
import { shuffle } from '../utilities';

/**
 * Clears tasks from player objects in preparation for dealing new tasks.
 * Used when starting a new game with the same players.
 */
export function removePlayerTasks(state: GameState): GameState {
  const newState = structuredClone(state);
  newState.players = newState.players.map(player => {
    const { tasks, ...playerWithoutTasks } = player;
    return playerWithoutTasks;
  });
  return newState;
}

/**
 * Returns a random ordering of tasks for the given `difficulty`.
 *
 * Can optionally be passed a `pool` (ordered subset) of tasks from which
 * the returned ordering will begin.
 *
 * Tasks will be shuffled and appended to `pool` at most once; any `taskId`
 * included in `pool` will not be included in reshuffled tasks.
 *
 * @param pool Optional array of `taskId`s from which to begin picking.
 *  Represents a stack of shuffled tasks that persists across games.
 * @param difficulty Desired difficulty level of the returned task list.
 * @param difficultyIndex Index in `TASKS_DATA` to use when calculating difficulty.
 * @returns An object with two properties:
 *  `tasksToUse`: Array of `taskId`s whose difficulties add up to `difficulty`.
 *    Uses ordering from `pool` until not enough tasks remain.
 *  `leftoverTasks`: Array of any skipped or unused `taskId`s in the shuffled order.
 *    Represents the stack of shuffled tasks that should be used to deal the next game.
 */
export function getTasksForDifficulty(
  pool: number[],
  difficulty: number,
  difficultyIndex: number,
): {
  tasksToUse: number[];
  leftoverTasks: number[];
} {
  const initialPool = [...pool];
  const tasksToUse = [];
  const skippedTasks = [];
  let difficultyCounter = 0;
  let hasReshuffledTasks = false;
  while (difficultyCounter < difficulty) {
    const newTaskId = pool.shift();
    if (newTaskId === undefined) {
      if (hasReshuffledTasks) {
        // only allow reshuffling once per call of this function
        throw new Error('Failed to reach difficulty');
      }
      pool = pool.concat(
        shuffle(
          Object.keys(TASKS_DATA)
            .map(taskIdString => ~~taskIdString)
            .filter(taskId => !initialPool.includes(taskId)),
        ),
      );
      hasReshuffledTasks = true;
      continue;
    }
    const newTaskDifficulty = TASKS_DATA[newTaskId].difficulty[difficultyIndex];
    if (difficultyCounter + newTaskDifficulty > difficulty) {
      skippedTasks.push(newTaskId);
    } else {
      tasksToUse.push(newTaskId);
      difficultyCounter += newTaskDifficulty;
    }
  }
  return { tasksToUse, leftoverTasks: skippedTasks.concat(pool) };
}

/**
 * Computes the winning `playerId` of a given complete trick.
 */
export function computeWinner(trick: Trick, numberOfPlayers: number): number {
  if (!trick.cards || trick.cards.length !== numberOfPlayers) {
    throw new Error('Trick is not completed, cannot compute winner');
  }
  let highestBlackPos: number | null = null;
  let highestLedPos = 0;
  trick.cards.forEach((trickCard, index, cards) => {
    if (
      trickCard.suit === Suit.BLACK &&
      (highestBlackPos === null || cards[highestBlackPos].number < trickCard.number)
    ) {
      highestBlackPos = index;
    }
    if (
      highestBlackPos === null &&
      trickCard.suit === cards[0].suit &&
      cards[highestLedPos].number < trickCard.number
    ) {
      highestLedPos = index;
    }
  });
  const winningPos = highestBlackPos !== null ? highestBlackPos : highestLedPos;
  return (winningPos + trick.leader) % numberOfPlayers;
}

/**
 * Computes the state of all tasks once a trick is complete.
 * NOTE: Mutates state!!!
 */
export function computeAndSetTaskState(state: GameState) {
  state.players.forEach(player => {
    if (!player.tasks) return;
    Object.values(player.tasks).forEach(task => {
      if (task.done || task.failed) return;
      const taskState = TASKS_DATA[task.id].test(state, player.id);
      if (taskState === TaskState.SUCCESS) {
        state.players[player.id].tasks![task.id].done = true;
      } else if (taskState === TaskState.FAILURE) {
        state.players[player.id].tasks![task.id].failed = true;
      }
    });
  });
}
