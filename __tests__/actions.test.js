import * as Actions from '../src/actions';
import * as ActionUtilities from '../src/actions/utilities';
import { TASKS_DATA } from '../src/data';
import { shuffle } from '../src/utilities';
import { createGameState } from './util';

const sum = arr => arr.reduce((acc, num) => acc + num, 0);

const NUM_TASKS_IN_GAME = 96; // Object.keys(TASKS_DATA).filter(taskId => !TASKS_DATA[taskId].special).length

describe('dealTasks', () => {
  it('randomly selects tasks', () => {
    const state = createGameState();
    const newState1 = Actions.dealTasks(state, 10);
    const newState2 = Actions.dealTasks(state, 10);
    expect(newState1.unassignedTasks.tasks).not.toEqual(newState2.unassignedTasks.tasks);
    expect(newState1.unassignedTasks.order).not.toEqual(newState2.unassignedTasks.order);
  });
  it('selects tasks that add up to the correct difficulty', () => {
    const state = createGameState();
    const newState3Players = Actions.dealTasks(state, 10);
    const difficulties3Players = Object.keys(newState3Players.unassignedTasks.tasks).map(
      taskId => TASKS_DATA[taskId].difficulty[0],
    );
    expect(sum(difficulties3Players)).toEqual(10);

    state.players.push({});
    const newState4Players = Actions.dealTasks(state, 10);
    const difficulties4Players = Object.keys(newState4Players.unassignedTasks.tasks).map(
      taskId => TASKS_DATA[taskId].difficulty[1],
    );
    expect(sum(difficulties4Players)).toEqual(10);

    state.players.push({});
    const newState5Players = Actions.dealTasks(state, 30);
    const difficulties5Players = Object.keys(newState5Players.unassignedTasks.tasks).map(
      taskId => TASKS_DATA[taskId].difficulty[2],
    );
    expect(sum(difficulties5Players)).toEqual(30);
  });
  it('saves the order the tasks were dealt', () => {
    const state = createGameState();
    const newState = Actions.dealTasks(state, 30);
    const tasksInListMissingFromOrder = Object.keys(newState.unassignedTasks.tasks).filter(
      taskId => !newState.unassignedTasks.order.includes(~~taskId),
    );
    const tasksInOrderMissingFromList = newState.unassignedTasks.order.filter(
      taskId => !newState.unassignedTasks.tasks[taskId],
    );
    expect(tasksInListMissingFromOrder.length).toEqual(0);
    expect(tasksInOrderMissingFromList.length).toEqual(0);
  });
  it('throws if given too high a difficulty', () => {
    expect(() => Actions.dealTasks(createGameState(), 1000)).toThrow(Error);
  });
  it('uses leftoverTasks if they exist', () => {
    const state = createGameState();
    state.leftoverTasks = [47, 48, 49];
    const newState = Actions.dealTasks(state, 7);
    expect(newState.unassignedTasks.tasks).toEqual({ 47: { id: 47 }, 48: { id: 48 }, 49: { id: 49 } });
    expect(newState.unassignedTasks.order).toEqual([47, 48, 49]);
  });
  it('uses leftoverTasks and then redeals the rest if difficulty is too high', () => {
    const state = createGameState();
    state.leftoverTasks = [47];
    const newState = Actions.dealTasks(state, 4);

    // should deal task 47 and then a random difficulty 1 task
    expect(newState.unassignedTasks.tasks[47]).toEqual({ id: 47 });
    expect(newState.unassignedTasks.order[0]).toEqual(47);
    expect(newState.unassignedTasks.order.length).toEqual(2);
    expect(TASKS_DATA[newState.unassignedTasks.order[1]].difficulty[0]).toEqual(1);

    // leftoverTasks should now include all tasks in the game
    // except for 47 and the other difficulty 1 task it just dealt
    expect(newState.leftoverTasks.length).toEqual(NUM_TASKS_IN_GAME - 2);
    expect(newState.leftoverTasks.includes(47)).toBe(false);
    expect(newState.leftoverTasks.includes(newState.unassignedTasks.order[1])).toBe(false);
  });
});

describe('toggleClaimTask', () => {
  const state = createGameState();
  state.unassignedTasks = {
    order: [5],
    tasks: {
      5: { id: 5 },
    },
  };

  it('assigns provisionalPlayerId to the task', () => {
    expect(Actions.toggleClaimTask(state, 2, 5).unassignedTasks.tasks).toEqual({
      5: { id: 5, provisionalPlayerId: 2 },
    });
  });
  it('throws if taskId is not in unassignedTasks', () => {
    expect(() => Actions.toggleClaimTask(state, 2, 6)).toThrow(Error);
  });
  it('unclaims the task if playerId is already provisionally assigned', () => {
    const state = createGameState();
    state.unassignedTasks = {
      order: [5],
      tasks: {
        5: { id: 5, provisionalPlayerId: 2 },
      },
    };
    expect(Actions.toggleClaimTask(state, 2, 5).unassignedTasks.tasks).toEqual({
      5: { id: 5 },
    });
  });
  it('erases any extra task data already attached', () => {
    const state = createGameState();
    state.unassignedTasks = {
      order: [5],
      tasks: {
        5: { id: 5, provisionalPlayerId: 1, data: { n: 3 } },
      },
    };
    expect(Actions.toggleClaimTask(state, 2, 5).unassignedTasks.tasks).toEqual({
      5: { id: 5, provisionalPlayerId: 2 },
    });
  });
});

describe('addDataToTask', () => {
  it('adds data to the task', () => {
    const state = createGameState();
    state.unassignedTasks = {
      order: [5, 94],
      tasks: { 5: { id: 5 }, 94: { id: 94 } },
    };
    expect(Actions.addDataToTask(state, 0, 94, { n: 1 }).unassignedTasks.tasks).toEqual({
      5: { id: 5 },
      94: { id: 94, provisionalPlayerId: 0, data: { n: 1 } },
    });
  });
  it('claims the task if another player provisionally owns it', () => {
    const state = createGameState();
    state.unassignedTasks = {
      order: [5, 94],
      tasks: { 5: { id: 5 }, 94: { id: 94, provisionalPlayerId: 1 } },
    };
    expect(Actions.addDataToTask(state, 0, 94, { n: 1 }).unassignedTasks.tasks).toEqual({
      5: { id: 5 },
      94: { id: 94, provisionalPlayerId: 0, data: { n: 1 } },
    });
  });
  it('throws if taskId is not in unassignedTasks', () => {
    const state = createGameState();
    state.unassignedTasks = {
      order: [5, 94],
      tasks: { 5: { id: 5 }, 94: { id: 94 } },
    };
    expect(() => Actions.addDataToTask(state, 0, 6, { n: 1 })).toThrow(Error);
  });
});

describe('kickTask', () => {
  const unassignedTasks = {
    order: [7, 5, 6, 4],
    tasks: {
      4: { id: 4, provisionalPlayerId: 0 },
      5: { id: 5, provisionalPlayerId: 2 },
      6: { id: 6, provisionalPlayerId: 1 },
      7: { id: 7 },
    },
  };
  const leftoverTasks = shuffle([...Array(96).keys()].filter(num => num < 4 || num > 7));

  it('removes task from unassignedTasks and replaces the correct amount of difficulty for 3P', () => {
    const state = createGameState();
    state.unassignedTasks = unassignedTasks;
    state.leftoverTasks = leftoverTasks;
    const newState = Actions.kickTask(state, 5);
    expect(newState.unassignedTasks.tasks[4]).toEqual({ id: 4, provisionalPlayerId: 0 });
    expect(newState.unassignedTasks.tasks[6]).toEqual({ id: 6, provisionalPlayerId: 1 });
    expect(newState.unassignedTasks.tasks[7]).toEqual({ id: 7 });
    expect(newState.unassignedTasks.tasks[5]).toBeUndefined();
    expect(newState.unassignedTasks.order[0]).toEqual(7);
    expect(newState.unassignedTasks.order[1]).toEqual(6);
    expect(newState.unassignedTasks.order[2]).toEqual(4);
    expect(Object.keys(newState.unassignedTasks.tasks).length).toBeGreaterThan(3);

    const difficulties = Object.keys(newState.unassignedTasks.tasks).map(taskId => TASKS_DATA[taskId].difficulty[0]);
    expect(sum(difficulties)).toEqual(6);
  });
  it('replaces the correct amount of difficulty for 4P', () => {
    const state = createGameState();
    state.unassignedTasks = unassignedTasks;
    state.leftoverTasks = leftoverTasks;
    state.players.push({});
    const newState = Actions.kickTask(state, 7);
    expect(newState.unassignedTasks.tasks[7]).toBeUndefined();
    expect(newState.unassignedTasks.order[0]).toEqual(5);
    const difficulties = Object.keys(newState.unassignedTasks.tasks).map(taskId => TASKS_DATA[taskId].difficulty[1]);
    expect(sum(difficulties)).toEqual(9);
  });
  it('replaces the correct amount of difficulty for 5P', () => {
    const state = createGameState();
    state.unassignedTasks = unassignedTasks;
    state.leftoverTasks = leftoverTasks;
    state.players.push({});
    state.players.push({});
    const newState = Actions.kickTask(state, 7);
    expect(newState.unassignedTasks.tasks[7]).toBeUndefined();
    expect(newState.unassignedTasks.order[0]).toEqual(5);
    const difficulties = Object.keys(newState.unassignedTasks.tasks).map(taskId => TASKS_DATA[taskId].difficulty[2]);
    expect(sum(difficulties)).toEqual(11);
  });
  it('uses tasks in order from leftoverTasks', () => {
    const state = createGameState();
    state.unassignedTasks = unassignedTasks;
    state.players.push({});
    state.players.push({});

    state.leftoverTasks = [70, 71, 72, 74, 77];
    const newState1 = Actions.kickTask(state, 7);
    expect(newState1.unassignedTasks.tasks[7]).toBeUndefined();
    expect(newState1.unassignedTasks.tasks[70]).toBeDefined();
    expect(newState1.unassignedTasks.tasks[71]).toBeDefined();
    expect(newState1.unassignedTasks.tasks[72]).toBeUndefined();
    expect(newState1.unassignedTasks.tasks[74]).toBeUndefined();
    expect(newState1.unassignedTasks.tasks[77]).toBeDefined();
    expect(newState1.unassignedTasks.order).toEqual([5, 6, 4, 70, 71, 77]);
    expect(Object.keys(newState1.unassignedTasks.tasks).length).toEqual(6);

    state.leftoverTasks = [72, 73, 74];
    const newState2 = Actions.kickTask(state, 7);
    expect(newState2.unassignedTasks.tasks[7]).toBeUndefined();
    expect(newState2.unassignedTasks.tasks[72]).toBeDefined();
    expect(newState2.unassignedTasks.tasks[73]).toBeUndefined();
    expect(newState2.unassignedTasks.tasks[74]).toBeUndefined();
    expect(newState2.unassignedTasks.order).toEqual([5, 6, 4, 72]);
    expect(Object.keys(newState2.unassignedTasks.tasks).length).toEqual(4);
  });
});

describe('finalizeTasks', () => {
  it('throws if unassignedTasks is empty', () => {
    expect(() => Actions.finalizeTasks(createGameState())).toThrow(Error);
  });
  it('throws if any task has no provisionalPlayerId', () => {
    const state = createGameState();
    state.unassignedTasks = {
      order: [4, 5],
      tasks: {
        4: { id: 4, provisionalPlayerId: 0 },
        5: { id: 5 },
      },
    };
    expect(() => Actions.finalizeTasks(state)).toThrow(Error);
  });
  it('throws if a task is assigned to a nonexistent player', () => {
    const state = createGameState();
    state.unassignedTasks = {
      order: [4],
      tasks: {
        4: { id: 4, provisionalPlayerId: 3 },
      },
    };
    expect(() => Actions.finalizeTasks(state)).toThrow(Error);
  });
  it('moves tasks to player data and saves ruleset', () => {
    const state = createGameState();
    state.unassignedTasks = {
      order: [4, 5, 6, 7, 94, 95],
      tasks: {
        4: { id: 4, provisionalPlayerId: 0 },
        5: { id: 5, provisionalPlayerId: 2 },
        6: { id: 6, provisionalPlayerId: 1 },
        7: { id: 7, provisionalPlayerId: 0 },
        94: { id: 94, provisionalPlayerId: 0, data: { n: 0 } },
        95: { id: 95, provisionalPlayerId: 1, data: { n: 5 } },
      },
    };
    delete state.players[0].tasks;
    delete state.players[1].tasks;
    const newState = Actions.finalizeTasks(state);
    expect(newState.unassignedTasks).toBeUndefined();
    expect(newState.players[0].tasks).toEqual({
      4: { id: 4, done: false, failed: false },
      7: { id: 7, done: false, failed: false },
      94: { id: 94, done: false, failed: false, data: { n: 0 } },
    });
    expect(newState.players[1].tasks).toEqual({
      6: { id: 6, done: false, failed: false },
      95: { id: 95, done: false, failed: false, data: { n: 5 } },
    });
    expect(newState.players[2].tasks).toEqual({ 5: { id: 5, done: false, failed: false } });
  });
});

describe('retryGame', () => {
  const state = createGameState();
  state.players[0].tasks[23].failed = true;
  state.timeout = true;
  state.players[1].isDealer = true;
  state.players[2].isDealer = false;
  const newState = Actions.retryGame(state);

  it('resets tasks', () => {
    expect(newState.unassignedTasks).toEqual({
      order: [14, 23],
      tasks: { 23: { id: 23 }, 14: { id: 14 } },
    });
    for (const player of newState.players) {
      expect(player.tasks).toBeUndefined();
    }
  });
  it('re-deals hands and moves the dealer to the next player', () => {
    expect(newState.players[2].isDealer).toBe(true);
    expect(newState.players[0].isDealer).toBe(false);
    expect(newState.players[1].isDealer).toBe(false);

    expect(newState.players[0].extraCards).toEqual(1);
    expect(newState.players[1].extraCards).toEqual(0);
    expect(newState.players[2].extraCards).toEqual(0);

    expect(newState.players[0].hand.length).toEqual(14);
    expect(newState.players[1].hand.length).toEqual(13);
    expect(newState.players[2].hand.length).toEqual(13);
  });
  it('resets tricks, timeout and player hint state', () => {
    expect(newState.tricks).toEqual([]);
    expect(newState.timeout).toBe(false);

    for (const player of newState.players) {
      expect(player.hint).toEqual({ used: false });
    }
  });
  it('keeps player data', () => {
    expect(newState.players[0].name === 'Nathan');
    expect(newState.players[1].name === 'Eric');
    expect(newState.players[2].name === 'Melora');
  });
});

describe('removePlayerTasks', () => {
  it('removes all tasks assigned to any players', () => {
    const newState = ActionUtilities.removePlayerTasks(createGameState());
    for (const player of newState.players) {
      expect(player.tasks).toBeUndefined();
    }
  });
});

describe('computeWinner', () => {
  it('throws if the trick is not completed', () => {
    const trick = {
      leader: 0,
      cards: [{ number: 9, suit: 'blue' }],
    };
    expect(() => ActionUtilities.computeWinner(trick, 3)).toThrow(Error);
  });
  it('returns the player of the highest card in the led suit, if no black cards', () => {
    const trick = {
      leader: 0,
      cards: [
        { number: 6, suit: 'blue' },
        { number: 5, suit: 'blue' },
        { number: 9, suit: 'green' },
        { number: 7, suit: 'blue' },
      ],
    };
    expect(ActionUtilities.computeWinner(trick, 4)).toEqual(3);
    trick.leader = 2;
    expect(ActionUtilities.computeWinner(trick, 4)).toEqual(1);
  });
  it('returns the player of the highest black card, if any exist', () => {
    const trick = {
      leader: 2,
      cards: [
        { number: 6, suit: 'blue' },
        { number: 4, suit: 'black' },
        { number: 3, suit: 'black' },
      ],
    };
    expect(ActionUtilities.computeWinner(trick, 3)).toEqual(0);
  });
});

describe('computeAndSetTaskState', () => {
  it('sets done state if a task has succeeded', () => {
    const state = createGameState();
    state.players[0].tasks = { 70: { id: 70, done: false, failed: false } }; // win first trick
    state.tricks = [
      {
        winner: 0,
        leader: 1,
        cards: [
          { number: 3, suit: 'green' },
          { number: 9, suit: 'blue' },
          { number: 5, suit: 'green' },
        ],
      },
    ];
    ActionUtilities.computeAndSetTaskState(state);
    expect(state.players[0].tasks).toEqual({ 70: { id: 70, done: true, failed: false } });
  });
  it('sets failure state if a task has failed', () => {
    const state = createGameState();
    state.players[0].tasks = { 70: { id: 70, done: false, failed: false } }; // win first trick
    state.tricks = [
      {
        winner: 2,
        leader: 0,
        cards: [
          { number: 3, suit: 'green' },
          { number: 9, suit: 'blue' },
          { number: 5, suit: 'green' },
        ],
      },
    ];
    ActionUtilities.computeAndSetTaskState(state);
    expect(state.players[0].tasks).toEqual({ 70: { id: 70, done: false, failed: true } });
  });
  it('ignores a task that is still pending', () => {
    const state = createGameState();
    state.players[0].tasks = { 71: { id: 71, done: false, failed: false } }; // win first 2 tricks
    state.tricks = [
      {
        winner: 0,
        leader: 1,
        cards: [
          { number: 3, suit: 'green' },
          { number: 9, suit: 'blue' },
          { number: 5, suit: 'green' },
        ],
      },
    ];
    ActionUtilities.computeAndSetTaskState(state);
    expect(state.players[0].tasks).toEqual({ 71: { id: 71, done: false, failed: false } });
  });
  it('ignores a task where state is already set', () => {
    const stateAlreadyDone = createGameState();
    stateAlreadyDone.players[0].tasks = { 70: { id: 70, done: true, failed: false } }; // win first trick
    stateAlreadyDone.tricks = [
      {
        winner: 2, // would fail
        leader: 0,
        cards: [
          { number: 3, suit: 'green' },
          { number: 9, suit: 'blue' },
          { number: 5, suit: 'green' },
        ],
      },
    ];
    ActionUtilities.computeAndSetTaskState(stateAlreadyDone);
    expect(stateAlreadyDone.players[0].tasks).toEqual({ 70: { id: 70, done: true, failed: false } });
    const stateAlreadyFailed = createGameState();
    stateAlreadyFailed.players[0].tasks = { 70: { id: 70, done: false, failed: true } }; // win first trick
    stateAlreadyFailed.tricks = [
      {
        winner: 0, // would succeed
        leader: 1,
        cards: [
          { number: 3, suit: 'green' },
          { number: 9, suit: 'blue' },
          { number: 5, suit: 'green' },
        ],
      },
    ];
    ActionUtilities.computeAndSetTaskState(stateAlreadyFailed);
    expect(stateAlreadyFailed.players[0].tasks).toEqual({ 70: { id: 70, done: false, failed: true } });
  });
});

describe('playCard', () => {
  it('throws if player is out of turn', () => {
    expect(() => Actions.playCard(createGameState(), 2, 0)).toThrow(Error);
  });
  it('throws if card is not legal to play', () => {
    const state = createGameState();
    state.players[1].hand[2].suit = 'pink';
    expect(() => Actions.playCard(state, 1, 0)).toThrow(Error);
  });
  it('removes card from player hand', () => {
    const state = createGameState();
    const newState = Actions.playCard(state, 1, 1);
    expect(newState.players[1].hand).toEqual([
      { number: 9, suit: 'green' },
      { number: 7, suit: 'green' },
    ]);
  });
  it('removes a hint that matches the card', () => {
    const state = createGameState();
    state.tricks.pop();
    const newState = Actions.playCard(state, 0, 1);
    expect(newState.players[0].hint).toEqual({ used: true });
  });
  it('adds a new trick if one is not already in progress', () => {
    const state = createGameState();
    state.tricks.pop();
    const newState = Actions.playCard(state, 0, 0);
    expect(newState.tricks[1]).toEqual({
      leader: 0,
      cards: [{ number: 4, suit: 'black' }],
    });
  });
  it('adds to an existing trick if one is in progress', () => {
    const state = createGameState();
    const newState = Actions.playCard(state, 1, 0);
    expect(newState.tricks[1]).toEqual({
      leader: 0,
      cards: [
        { number: 4, suit: 'pink' },
        { number: 9, suit: 'green' },
      ],
    });
  });
  it('computes the winner of a trick if one was just finished', () => {
    const state = createGameState();
    const newState = Actions.playCard(Actions.playCard(state, 1, 0), 2, 0);
    expect(newState.tricks[1]).toEqual({
      leader: 0,
      cards: [
        { number: 4, suit: 'pink' },
        { number: 9, suit: 'green' },
        { number: 9, suit: 'pink' },
      ],
      winner: 2,
    });
  });
  it('sets task state if a trick was just finished', () => {
    const state = createGameState();
    state.players[0].tasks[71] = { id: 71, done: false, failed: false };
    state.players[1].tasks[77] = { id: 77, done: false, failed: false };
    state.tricks[1].cards = [
      { number: 9, suit: 'yellow' },
      { number: 8, suit: 'yellow' },
    ];
    const newState = Actions.playCard(state, 2, 1);
    expect(newState.tricks[1]).toEqual({
      leader: 0,
      cards: [
        { number: 9, suit: 'yellow' },
        { number: 8, suit: 'yellow' },
        { number: 7, suit: 'yellow' },
      ],
      winner: 0,
    });
    expect(newState.players[0].tasks).toEqual({
      ...state.players[0].tasks,
      71: { id: 71, done: true, failed: false },
    });
    expect(newState.players[1].tasks).toEqual(state.players[1].tasks);
  });
});

describe('giveHint', () => {
  it('throws if between tricks', () => {
    expect(() => Actions.giveHint(createGameState(), 2, 0, 'middle')).toThrow(Error);
  });
  it('throws if player has already given a hint', () => {
    const state = createGameState();
    state.tricks.pop();
    expect(() => Actions.giveHint(state, 0, 1, 'top')).toThrow(Error);
    state.players[2].hint = { used: true };
    expect(() => Actions.giveHint(state, 2, 0, 'middle')).toThrow(Error);
  });
  it('gives a valid hint', () => {
    const state = createGameState();
    state.tricks.pop();
    const newState = Actions.giveHint(state, 2, 0, 'middle');
    expect(newState.players[2].hint).toEqual({ used: true, card: { number: 9, suit: 'pink' }, placement: 'middle' });
  });
  it('throws if there are not enough hints remaining in the game', () => {
    const state = createGameState();
    state.tricks.pop();
    state.ruleset = { hintMode: 'fewer' };
    expect(() => Actions.giveHint(state, 2, 0, 'middle')).toThrow(Error);
  });
  it('throws if ruleset hint mode is none', () => {
    const state = createGameState();
    state.tricks.pop();
    state.players[0].hint = { used: false };
    state.ruleset = { hintMode: 'none' };
    expect(() => Actions.giveHint(state, 2, 0, 'middle')).toThrow(Error);
  });
});

describe('toggleTaskDone', () => {
  it('throws if player does not have the given task', () => {
    expect(() => Actions.toggleTaskDone(createGameState(), 0, 0)).toThrow(Error);
    expect(() => Actions.toggleTaskDone(createGameState(), 1, 24)).toThrow(Error);
    expect(() => Actions.toggleTaskDone(createGameState(), 2, 0)).toThrow(Error);
  });
  it('toggles done state of a task', () => {
    const state = createGameState();
    const newState1 = Actions.toggleTaskDone(state, 0, 23);
    expect(newState1.players[0].tasks['23'].done).toBe(true);
    const newState2 = Actions.toggleTaskDone(state, 0, 14);
    expect(newState2.players[0].tasks['14'].done).toBe(false);
  });
  it('unsets failed state if set', () => {
    const state = createGameState();
    state.players[0].tasks[23].failed = true;
    state.players[0].tasks[14].failed = true;
    const newState = Actions.toggleTaskDone(Actions.toggleTaskDone(state, 0, 23), 0, 14);
    expect(newState.players[0].tasks['23'].failed).toBe(false);
    expect(newState.players[0].tasks['14'].failed).toBe(false);
  });
});

describe('dealPlayerHands', () => {
  it('deals players the correct number of cards', () => {
    const state = {
      players: [
        {
          id: 0,
          key: 'AAAA',
          name: 'Nathan',
        },
        {
          id: 1,
          key: 'BBBB',
          name: 'Eric',
        },
        {
          id: 2,
          key: 'CCCC',
          name: 'Melora',
        },
      ],
    };
    const newState = Actions.dealPlayerHands(state, 1);
    expect(newState.players[0].hand.length).toBe(13);
    expect(newState.players[1].hand.length).toBe(13);
    expect(newState.players[2].hand.length).toBe(14);
    expect(newState.players[0].extraCards).toBe(0);
    expect(newState.players[1].extraCards).toBe(0);
    expect(newState.players[2].extraCards).toBe(1);
    expect(newState.players[0].isDealer).toBe(false);
    expect(newState.players[1].isDealer).toBe(true);
    expect(newState.players[2].isDealer).toBe(false);

    state.players.push({ id: 3, key: 'DDDD', name: 'Michael' });
    const newState4P = Actions.dealPlayerHands(state, 3);
    expect(newState4P.players[0].hand.length).toBe(10);
    expect(newState4P.players[1].hand.length).toBe(10);
    expect(newState4P.players[2].hand.length).toBe(10);
    expect(newState4P.players[3].hand.length).toBe(10);
    expect(newState4P.players[0].extraCards).toBe(0);
    expect(newState4P.players[1].extraCards).toBe(0);
    expect(newState4P.players[2].extraCards).toBe(0);
    expect(newState4P.players[3].extraCards).toBe(0);
    expect(newState4P.players[0].isDealer).toBe(false);
    expect(newState4P.players[1].isDealer).toBe(false);
    expect(newState4P.players[2].isDealer).toBe(false);
    expect(newState4P.players[3].isDealer).toBe(true);

    state.players.push({ id: 3, key: 'EEEE', name: 'Rachel' });
    const newState5P = Actions.dealPlayerHands(state, 0);
    expect(newState5P.players[0].hand.length).toBe(8);
    expect(newState5P.players[1].hand.length).toBe(8);
    expect(newState5P.players[2].hand.length).toBe(8);
    expect(newState5P.players[3].hand.length).toBe(8);
    expect(newState5P.players[4].hand.length).toBe(8);
    expect(newState5P.players[0].extraCards).toBe(0);
    expect(newState5P.players[1].extraCards).toBe(0);
    expect(newState5P.players[2].extraCards).toBe(0);
    expect(newState5P.players[3].extraCards).toBe(0);
    expect(newState5P.players[4].extraCards).toBe(0);
    expect(newState5P.players[0].isDealer).toBe(true);
    expect(newState5P.players[1].isDealer).toBe(false);
    expect(newState5P.players[2].isDealer).toBe(false);
    expect(newState5P.players[3].isDealer).toBe(false);
    expect(newState5P.players[4].isDealer).toBe(false);
  });
  it('assigns the captain to exactly one player', () => {
    const state = {
      players: [
        {
          id: 0,
          key: 'AAAA',
          name: 'Nathan',
        },
        {
          id: 1,
          key: 'BBBB',
          name: 'Eric',
        },
        {
          id: 2,
          key: 'CCCC',
          name: 'Melora',
        },
      ],
    };
    const newState = Actions.dealPlayerHands(state, 0);
    expect(newState.players.filter(player => player.isCaptain).length).toBe(1);
  });
  it('sets up state objects', () => {
    const state = {
      players: [
        {
          id: 0,
          key: 'AAAA',
          name: 'Nathan',
        },
        {
          id: 1,
          key: 'BBBB',
          name: 'Eric',
        },
        {
          id: 2,
          key: 'CCCC',
          name: 'Melora',
        },
      ],
    };
    const newState = Actions.dealPlayerHands(state, 0);
    newState.players.forEach(player => {
      expect(player.hint).toEqual({ used: false });
    });
    expect(newState.tricks).toEqual([]);
    expect(newState.timeout).toBe(false);
  });
});
