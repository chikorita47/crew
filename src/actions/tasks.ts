import { TASKS_DATA } from '../data';
import { getNumberOfPlayers, getLeftoverTasks } from '../selectors';
import { GameState, UnassignedTaskList, TaskData } from '../types';

import { getTasksForDifficulty } from './utilities';

/**
 * Deals tasks for the given `difficulty`.
 *
 * Uses `leftoverTasks`, if it exists, for ordering until not enough remain.
 * Assigns unused shuffled tasks to `leftoverTasks`.
 */
export function dealTasks(state: GameState, difficulty: number): GameState {
  const numberOfPlayers = getNumberOfPlayers(state);

  const { tasksToUse, leftoverTasks } = getTasksForDifficulty(getLeftoverTasks(state), difficulty, numberOfPlayers - 3);

  const newState = structuredClone(state);

  newState.unassignedTasks = {
    order: tasksToUse,
    tasks: tasksToUse.reduce(
      (acc, taskId) => ({
        ...acc,
        [taskId]: {
          id: taskId,
        },
      }),
      {} as UnassignedTaskList,
    ),
  };
  newState.leftoverTasks = leftoverTasks;
  newState.difficulty = difficulty;

  return newState;
}

/**
 * Claims the given task for the given player.
 * If the given player has already claimed the task, removes the claim.
 */
export function toggleClaimTask(state: GameState, playerId: number, taskId: number): GameState {
  const newState = structuredClone(state);
  if (!newState.unassignedTasks?.tasks[taskId]) throw new Error('Cannot claim task that is not in the game');
  const shouldToggleOff = newState.unassignedTasks.tasks[taskId].provisionalPlayerId === playerId;
  newState.unassignedTasks.tasks[taskId] = {
    id: taskId,
  };
  if (!shouldToggleOff) {
    newState.unassignedTasks.tasks[taskId].provisionalPlayerId = playerId;
  }
  return newState;
}

/**
 * Adds `data` to a task. (Used only for tasks 94 and 95.)
 */
export function addDataToTask(state: GameState, playerId: number, taskId: number, data: TaskData): GameState {
  const newState = structuredClone(state);
  if (!newState.unassignedTasks?.tasks[taskId]) throw new Error('Cannot add data to task that is not in the game');
  newState.unassignedTasks.tasks[taskId].data = data;
  newState.unassignedTasks.tasks[taskId].provisionalPlayerId = playerId;
  return newState;
}

/**
 * Kicks a task out of `unassignedTasks` and replaces it with one or more new tasks
 * in order to maintain the game's difficulty level.
 *
 * Uses `leftoverTasks`, if it exists, for ordering until not enough remain.
 * Assigns unused shuffled tasks to `leftoverTasks`.
 */
export function kickTask(state: GameState, taskId: number): GameState {
  if (!state.leftoverTasks) {
    throw new Error('Could not kick task, there are no other tasks left');
  }
  if (!state.unassignedTasks) {
    throw new Error('Could not kick tasks, assignments have already been finalized');
  }

  const difficultyIndex = getNumberOfPlayers(state) - 3;
  const difficulty = TASKS_DATA[taskId].difficulty![difficultyIndex];

  if (!difficulty) {
    throw new Error('Cannot kick task with no difficulty');
  }

  const { tasksToUse, leftoverTasks } = getTasksForDifficulty([...state.leftoverTasks], difficulty, difficultyIndex);

  const newState = structuredClone(state);

  const orderPos = newState.unassignedTasks!.order.indexOf(taskId);
  newState.unassignedTasks!.order.splice(orderPos, 1);
  delete newState.unassignedTasks!.tasks[taskId];

  tasksToUse.forEach(taskId => {
    newState.unassignedTasks!.order.push(taskId);
    newState.unassignedTasks!.tasks[taskId] = { id: taskId };
  });
  newState.leftoverTasks = leftoverTasks;

  return newState;
}

/**
 * Allows a player to mark their own task as done, or undo such a marking. Sets `failed` to false.
 * Failsafe in case task tests don't work correctly.
 */
export function toggleTaskDone(state: GameState, playerId: number, taskId: number): GameState {
  const newState = structuredClone(state);
  if (!newState.players[playerId].tasks?.[taskId]) throw new Error(`Player does not have task ${taskId}`);
  newState.players[playerId].tasks![taskId].done = !newState.players[playerId].tasks![taskId].done;
  newState.players[playerId].tasks![taskId].failed = false;
  return newState;
}
