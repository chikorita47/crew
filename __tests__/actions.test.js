import * as Actions from '../src/actions';
import { TASKS_DATA } from '../src/data';
import { createGameState } from './util';

const sum = (arr) => arr.reduce((acc, num) => acc + num, 0);

describe('dealTasks', () => {
  it('randomly selects tasks', () => {
    const state = createGameState();
    const newState1 = Actions.dealTasks(state, 10);
    const newState2 = Actions.dealTasks(state, 10);
    expect(newState1.unassignedTasks).not.toEqual(newState2.unassignedTasks);
  });
  it('selects tasks that add up to the correct difficulty', () => {
    const state = createGameState();
    const newState3Players = Actions.dealTasks(state, 10);
    const difficulties3Players = Object.keys(newState3Players.unassignedTasks).map(taskId => TASKS_DATA[taskId].difficulty[0]);
    expect(sum(difficulties3Players)).toEqual(10);

    state.players.push({});
    const newState4Players = Actions.dealTasks(state, 10);
    const difficulties4Players = Object.keys(newState4Players.unassignedTasks).map(taskId => TASKS_DATA[taskId].difficulty[1]);
    expect(sum(difficulties4Players)).toEqual(10);

    state.players.push({});
    const newState5Players = Actions.dealTasks(state, 30);
    const difficulties5Players = Object.keys(newState5Players.unassignedTasks).map(taskId => TASKS_DATA[taskId].difficulty[2]);
    expect(sum(difficulties5Players)).toEqual(30);
  });
  it('throws if given too high a difficulty', () => {
    expect(() => Actions.dealTasks(createGameState(), 1000)).toThrow(Error);
  });
});

describe('claimTask', () => {
  const state = createGameState();
  state.unassignedTasks = {
    '5': { id: 5 },
  };

  it('assigns provisionalPlayerId to the task', () => {
    expect(Actions.claimTask(state, 2, 5).unassignedTasks).toEqual({
      '5': { id: 5, provisionalPlayerId: 2 },
    });
  });
  it('throws if taskId is not in unassignedTasks', () => {
    expect(() => Actions.claimTask(state, 2, 6)).toThrow(Error);
  });
});

xdescribe('kickTask', () => {
  const unassignedTasks = {
    '4': { id: 4, provisionalPlayerId: 0 },
    '5': { id: 5, provisionalPlayerId: 2 },
    '6': { id: 6, provisionalPlayerId: 1 },
    '7': { id: 7 },
  };

  it('removes task from unassignedTasks and replaces the correct amount of difficulty for 3P', () => {
    const state = createGameState();
    state.unassignedTasks = unassignedTasks;
    const newState = Actions.kickTask(state, 6);
    expect(newState.unassignedTasks[4]).toEqual({ id: 4, provisionalPlayerId: 0 });
    expect(newState.unassignedTasks[5]).toEqual({ id: 5, provisionalPlayerId: 2 });
    expect(newState.unassignedTasks[7]).toEqual({ id: 7 });
    expect(newState.unassignedTasks[6]).toBeUndefined();
    expect(Object.keys(newState.unassignedTasks).length).toBeGreaterThan(3);

    const difficulties = Object.keys(newState.unassignedTasks).map(taskId => TASKS_DATA[taskId].difficulty[0]);
    expect(sum(difficulties)).toEqual(11);
  });
  it('replaces the correct amount of difficulty for 4P', () => {
    const state = createGameState();
    state.unassignedTasks = unassignedTasks;
    state.players.push({});
    const newState = Actions.kickTask(state, 7);
    expect(newState.unassignedTasks[7]).toBeUndefined();
    const difficulties = Object.keys(newState.unassignedTasks).map(taskId => TASKS_DATA[taskId].difficulty[0]);
    expect(sum(difficulties)).toEqual(12);
  });
  it('replaces the correct amount of difficulty for 5P', () => {
    const state = createGameState();
    state.unassignedTasks = unassignedTasks;
    state.players.push({});
    state.players.push({});
    const newState = Actions.kickTask(state, 7);
    expect(newState.unassignedTasks[7]).toBeUndefined();
    const difficulties = Object.keys(newState.unassignedTasks).map(taskId => TASKS_DATA[taskId].difficulty[0]);
    expect(sum(difficulties)).toEqual(14);
  });
});

describe('finalizeTasksAndRuleset', () => {
  const ruleset = { hintMode: 'default' };

  it('throws if unassignedTasks is empty', () => {
    expect(() => Actions.finalizeTasksAndRuleset(createGameState(), ruleset)).toThrow(Error);
  });
  it('throws if any task has no provisionalPlayerId', () => {
    const state = createGameState();
    state.unassignedTasks = {
      '4': { id: 4, provisionalPlayerId: 0 },
      '5': { id: 5 }
    };
    expect(() => Actions.finalizeTasksAndRuleset(state, ruleset)).toThrow(Error);
  });
  it('throws if a task is assigned to a nonexistent player', () => {
    const state = createGameState();
    state.unassignedTasks = {
      '4': { id: 4, provisionalPlayerId: 3 },
    };
    expect(() => Actions.finalizeTasksAndRuleset(state, ruleset)).toThrow(Error);
  });
  it('moves tasks to player data and saves ruleset', () => {
    const state = createGameState();
    state.unassignedTasks = {
      '4': { id: 4, provisionalPlayerId: 0 },
      '5': { id: 5, provisionalPlayerId: 2 },
      '6': { id: 6, provisionalPlayerId: 1 },
      '7': { id: 7, provisionalPlayerId: 0 },
    };
    delete state.players[0].tasks;
    delete state.players[1].tasks;
    const newState = Actions.finalizeTasksAndRuleset(state, ruleset);
    expect(newState.ruleset).toEqual(ruleset);
    expect(newState.unassignedTasks).toBeUndefined();
    expect(newState.players[0].tasks).toEqual({ 4: { id: 4, done: false, failed: false }, 7: { id: 7, done: false, failed: false } });
    expect(newState.players[1].tasks).toEqual({ 6: { id: 6, done: false, failed: false } });
    expect(newState.players[2].tasks).toEqual({ 5: { id: 5, done: false, failed: false } });
  });
});

describe('computeWinner', () => {
  it('throws if the trick is not completed', () => {
    const trick = {
      leader: 0,
      cards: [
        { number: 9, suit: 'blue' },
      ],
    };
    expect(() => Actions.computeWinner(trick, 3)).toThrow(Error);
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
    expect(Actions.computeWinner(trick, 4)).toEqual(3);
    trick.leader = 2;
    expect(Actions.computeWinner(trick, 4)).toEqual(1);
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
    expect(Actions.computeWinner(trick, 3)).toEqual(0);
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
    expect(newState.players[1].hand).toEqual([{ number: 9, suit: 'green' }, { number: 7, suit: 'green' }]);
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
      cards: [
        { number: 4, suit: 'black' },
      ],
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
});

describe('getHintPlacement', () => {
  it('throws if the hint is invalid', () => {
    const state = createGameState();
    expect(() => Actions.getHintPlacement(state, 0, 0)).toThrow(Error);
    expect(() => Actions.getHintPlacement(state, 1, 1)).toThrow(Error);
  });
  it('returns the correct placement of the hint token for a valid hint', () => {
    const state = createGameState();
    expect(Actions.getHintPlacement(state, 2, 0)).toEqual('middle');
    expect(Actions.getHintPlacement(state, 2, 1)).toEqual('top');
    expect(Actions.getHintPlacement(state, 2, 2)).toEqual('bottom');
  });
});

describe('giveHint', () => {
  it('throws if between tricks', () => {
    expect(() => Actions.giveHint(createGameState(), 2, 0)).toThrow(Error);
  });
  it('throws if player has already given a hint', () => {
    const state = createGameState();
    state.tricks.pop();
    expect(() => Actions.giveHint(state, 0, 1)).toThrow(Error);
    state.players[2].hint = { used: true };
    expect(() => Actions.giveHint(state, 2, 0)).toThrow(Error);
  });
  it('gives a valid hint', () => {
    const state = createGameState();
    state.tricks.pop();
    const newState = Actions.giveHint(state, 2, 0);
    expect(newState.players[2].hint).toEqual({ used: true, card: { number: 9, suit: 'pink' }, placement: 'middle' });
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
});

describe('dealPlayerHands', () => {
  it('throws if the game is in progress', () => {
    expect(() => Actions.dealPlayerHands(createGameState(), 0)).toThrow(Error);
  });
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
        }
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
        }
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
        }
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
