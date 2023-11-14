import * as Actions from '../src/actions';
import { GOALS_DATA } from '../src/data';

function createGameState() {
  return {
    players: [
      {
        id: 0,
        key: 'AAAA',
        name: 'Nathan',
        hand: [{ number: 4, suit: 'black' }, { number: 9, suit: 'blue' }, { number: 7, suit: 'blue' }],
        hint: { used: true, card: { number: 9, suit: 'blue' }, placement: 'top' },
        goals: { 23: { id: 23, done: false }, 14: { id: 14, done: true } },
        isCaptain: true,
        isDealer: false,
        extraCards: 1,
      },
      {
        id: 1,
        key: 'BBBB',
        name: 'Eric',
        hand: [{ number: 9, suit: 'green' }, { number: 8, suit: 'green' }, { number: 7, suit: 'green' }],
        hint: { used: false },
        goals: {},
        isCaptain: false,
        isDealer: false,
        extraCards: 0,
      },
      {
        id: 2,
        key: 'CCCC',
        name: 'Melora',
        hand: [{ number: 9, suit: 'pink' }, { number: 7, suit: 'yellow' }, { number: 1, suit: 'yellow' }],
        hint: { used: false },
        isCaptain: false,
        isDealer: true,
        extraCards: 0,
      }
    ],
    tricks: [
      {
        winner: 0,
        leader: 1,
        cards: [
          { number: 3, suit: 'green' },
          { number: 5, suit: 'green' },
          { number: 9, suit: 'blue' },
        ],
      },
      {
        winner: null,
        leader: 0,
        cards: [
          { number: 4, suit: 'pink' },
        ],
      },
    ],
  };
}

describe('dealGoals', () => {
  const sum = (arr) => arr.reduce((acc, num) => acc + num, 0);

  it('randomly selects goals', () => {
    const state = createGameState();
    const newState1 = Actions.dealGoals(state, 10);
    const newState2 = Actions.dealGoals(state, 10);
    expect(newState1.unassignedGoals).not.toEqual(newState2.unassignedGoals);
  });
  it('selects goals that add up to the correct difficulty', () => {
    const state = createGameState();
    const newState3Players = Actions.dealGoals(state, 10);
    const difficulties3Players = Object.keys(newState3Players.unassignedGoals).map(goalId => GOALS_DATA[goalId].difficulty[0]);
    expect(sum(difficulties3Players)).toEqual(10);

    state.players.push({});
    const newState4Players = Actions.dealGoals(state, 10);
    const difficulties4Players = Object.keys(newState4Players.unassignedGoals).map(goalId => GOALS_DATA[goalId].difficulty[1]);
    expect(sum(difficulties4Players)).toEqual(10);

    state.players.push({});
    const newState5Players = Actions.dealGoals(state, 30);
    const difficulties5Players = Object.keys(newState5Players.unassignedGoals).map(goalId => GOALS_DATA[goalId].difficulty[2]);
    expect(sum(difficulties5Players)).toEqual(30);
  });
  it('throws if given too high a difficulty', () => {
    expect(() => Actions.dealGoals(createGameState(), 1000)).toThrow(Error);
  });
});

describe('claimGoal', () => {
  const state = createGameState();
  state.unassignedGoals = {
    '5': { id: 5 },
  };

  it('assigns provisionalPlayerId to the goal', () => {
    expect(Actions.claimGoal(state, 2, 5).unassignedGoals).toEqual({
      '5': { id: 5, provisionalPlayerId: 2 },
    });
  });
  it('throws if goalId is not in unassignedGoals', () => {
    expect(() => Actions.claimGoal(state, 2, 6)).toThrow(Error);
  });
});

describe('finalizeGoalsAndRuleset', () => {
  const ruleset = { hintMode: 'default' };

  it('throws if unassignedGoals is empty', () => {
    expect(() => Actions.finalizeGoalsAndRuleset(createGameState(), ruleset)).toThrow(Error);
  });
  it('throws if any goal has no provisionalPlayerId', () => {
    const state = createGameState();
    state.unassignedGoals = {
      '4': { id: 4, provisionalPlayerId: 0 },
      '5': { id: 5 }
    };
    expect(() => Actions.finalizeGoalsAndRuleset(state, ruleset)).toThrow(Error);
  });
  it('throws if a goal is assigned to a nonexistent player', () => {
    const state = createGameState();
    state.unassignedGoals = {
      '4': { id: 4, provisionalPlayerId: 3 },
    };
    expect(() => Actions.finalizeGoalsAndRuleset(state, ruleset)).toThrow(Error);
  });
  it('moves goals to player data and saves ruleset', () => {
    const state = createGameState();
    state.unassignedGoals = {
      '4': { id: 4, provisionalPlayerId: 0 },
      '5': { id: 5, provisionalPlayerId: 2 },
      '6': { id: 6, provisionalPlayerId: 1 },
      '7': { id: 7, provisionalPlayerId: 0 },
    };
    delete state.players[0].goals;
    delete state.players[1].goals;
    const newState = Actions.finalizeGoalsAndRuleset(state, ruleset);
    expect(newState.ruleset).toEqual(ruleset);
    expect(newState.unassignedGoals).toBeUndefined();
    expect(newState.players[0].goals).toEqual({ 4: { id: 4, done: false }, 7: { id: 7, done: false } });
    expect(newState.players[1].goals).toEqual({ 6: { id: 6, done: false } });
    expect(newState.players[2].goals).toEqual({ 5: { id: 5, done: false } });
  });
});
