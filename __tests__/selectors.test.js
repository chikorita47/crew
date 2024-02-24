import * as Selectors from '../src/selectors';
import { createGameState } from './util';

describe('getCaptainId', () => {
  it('finds the captain', () => {
    expect(Selectors.getCaptainId(createGameState())).toBe(0);
  });
  it('throws if no player is the captain', () => {
    const state = createGameState();
    state.players[0].isCaptain = false;
    expect(() => Selectors.getCaptainId(state)).toThrow(Error);
  });
});

describe('getDealerId', () => {
  it('finds the dealer', () => {
    expect(Selectors.getDealerName(createGameState())).toBe('Melora');
  });
  it('throws if no player is the dealer', () => {
    const state = createGameState();
    state.players[2].isDealer = false;
    expect(() => Selectors.getDealerName(state)).toThrow(Error);
  });
});

describe('getPlayerByName', () => {
  it('finds the player', () => {
    const state = createGameState();
    expect(Selectors.getPlayerByName(state, 'Eric')).toEqual(state.players[1]);
  });
  it('throws if no player by that name exists', () => {
    expect(() => Selectors.getPlayerByName(createGameState(), 'Greg')).toThrow(Error);
  });
});

describe('getOtherPlayersInOrder', () => {
  it('returns the other players in the correct display order', () => {
    const state = createGameState();
    expect(Selectors.getOtherPlayersInOrder(state, 0)).toEqual([state.players[1], state.players[2]]);
    expect(Selectors.getOtherPlayersInOrder(state, 1)).toEqual([state.players[2], state.players[0]]);
    expect(Selectors.getOtherPlayersInOrder(state, 2)).toEqual([state.players[0], state.players[1]]);
  });
});

describe('getUnassignedTasksExist', () => {
  it('returns true if unassigned tasks exist', () => {
    const state = createGameState();
    state.unassignedTasks = {
      order: [4, 5],
      tasks: {
        4: { id: 4, provisionalPlayerId: 0 },
        5: { id: 5 },
      },
    };
    expect(Selectors.getUnassignedTasksExist(state)).toBe(true);
  });
  it('returns false if not', () => {
    const state = createGameState();
    expect(Selectors.getUnassignedTasksExist(state)).toBe(false);
    state.unassignedTasks = {};
    expect(Selectors.getUnassignedTasksExist(state)).toBe(false);
  });
});

describe('getAreAllTasksAssigned', () => {
  it('returns false if unassigned tasks exist', () => {
    const state = createGameState();
    state.unassignedTasks = {
      order: [4, 5],
      tasks: {
        4: { id: 4, provisionalPlayerId: 0 },
        5: { id: 5 },
      },
    };
    expect(Selectors.getAreAllTasksAssigned(state)).toBe(false);
  });
  it('returns true if all tasks are assigned', () => {
    const state = createGameState();
    state.unassignedTasks = {
      order: [4, 5],
      tasks: {
        4: { id: 4, provisionalPlayerId: 0 },
        5: { id: 5, provisionalPlayerId: 1 },
      },
    };
    expect(Selectors.getAreAllTasksAssigned(state)).toBe(true);
  });
  it('returns false if unassignedTasks is empty', () => {
    const state = createGameState();
    expect(Selectors.getAreAllTasksAssigned(state)).toBe(false);
    state.unassignedTasks = {};
    expect(Selectors.getAreAllTasksAssigned(state)).toBe(false);
    state.unassignedTasks = { order: [], tasks: {} };
    expect(Selectors.getAreAllTasksAssigned(state)).toBe(false);
  });
  it('returns false if tasks requiring extra data do not have data', () => {
    const state = createGameState();
    state.unassignedTasks = {
      order: [4, 5, 94],
      tasks: {
        4: { id: 4, provisionalPlayerId: 0 },
        5: { id: 5, provisionalPlayerId: 1 },
        94: { id: 94, provisionalPlayerId: 2 },
      },
    };
    expect(Selectors.getAreAllTasksAssigned(state)).toBe(false);
  });
  it('returns true if all tasks requiring extra data have data', () => {
    const state = createGameState();
    state.unassignedTasks = {
      order: [4, 5, 94],
      tasks: {
        4: { id: 4, provisionalPlayerId: 0 },
        5: { id: 5, provisionalPlayerId: 1 },
        94: { id: 94, provisionalPlayerId: 2, data: { n: 0 } },
      },
    };
    expect(Selectors.getAreAllTasksAssigned(state)).toBe(true);
  });
});

describe('getIsGameStarted', () => {
  it('returns true if there are tricks in the game', () => {
    expect(Selectors.getIsGameStarted(createGameState())).toBe(true);
  });
  it('returns false if there are no tricks in the game', () => {
    const state = createGameState();
    state.tricks = [];
    expect(Selectors.getIsGameStarted(state)).toBe(false);
    const { tricks, ...newState } = state;
    expect(Selectors.getIsGameStarted(newState)).toBe(false);
  });
});

describe('getIsGameFinished', () => {
  it('returns false if not enough tricks have been played', () => {
    const state = createGameState();
    state.tricks = new Array(12);
    expect(Selectors.getIsGameFinished(state)).toBe(false);
  });
  it('returns false if the last trick has the wrong number of cards', () => {
    const state = createGameState();
    state.tricks = new Array(13);
    state.tricks[12] = { cards: new Array(2) };
    expect(Selectors.getIsGameFinished(state)).toBe(false);
    state.tricks[12] = { cards: new Array(4) };
    expect(Selectors.getIsGameFinished(state)).toBe(false);
  });
  it('returns true if the last trick has been played out fully', () => {
    const state = createGameState();
    state.tricks = new Array(13);
    state.tricks[12] = { cards: new Array(3) };
    expect(Selectors.getIsGameFinished(state)).toBe(true);

    state.players = new Array(4);
    state.tricks = new Array(10);
    state.tricks[9] = { cards: new Array(4) };
    expect(Selectors.getIsGameFinished(state)).toBe(true);

    state.players = new Array(5);
    state.tricks = new Array(8);
    state.tricks[7] = { cards: new Array(5) };
    expect(Selectors.getIsGameFinished(state)).toBe(true);
  });
  it('returns true if the timeout has been reached', () => {
    const state = createGameState();
    state.timeout = true;
    expect(Selectors.getIsGameFinished(state)).toBe(true);
  });
  it('returns true if a task has failed', () => {
    const state = createGameState();
    state.players[0].tasks[23].failed = true;
    expect(Selectors.getIsGameFinished(state)).toBe(true);
  });
  it('returns true if all tasks are done', () => {
    const state = createGameState();
    state.players[0].tasks[23].done = true;
    expect(Selectors.getIsGameFinished(state)).toBe(true);
  });
});

describe('getAreAllTasksDone', () => {
  it('returns false if any player has unfinished tasks', () => {
    expect(Selectors.getAreAllTasksDone(createGameState())).toBe(false);
  });
  it('returns false if any player has failed tasks', () => {
    const state = createGameState();
    state.players[0].tasks[23].failed = true;
    expect(Selectors.getAreAllTasksDone(state)).toBe(false);
  });
  it('returns true if no player has unfinished tasks', () => {
    const state = createGameState();
    state.players[0].tasks[23].done = true;
    expect(Selectors.getAreAllTasksDone(state)).toBe(true);
  });
});

describe('getHintPlacementForCard', () => {
  it('returns null if the hint is invalid', () => {
    const state = createGameState();
    expect(Selectors.getHintPlacementForCard(state, 0, 0)).toBeNull();
    expect(Selectors.getHintPlacementForCard(state, 1, 1)).toBeNull();
  });
  it('returns the correct placement of the hint token for a valid hint', () => {
    const state = createGameState();
    expect(Selectors.getHintPlacementForCard(state, 2, 0)).toEqual('middle');
    expect(Selectors.getHintPlacementForCard(state, 2, 1)).toEqual('top');
    expect(Selectors.getHintPlacementForCard(state, 2, 2)).toEqual('bottom');
  });
});

describe('getAreAllHintsUsed', () => {
  it('returns false if there are hints remaining', () => {
    const state = createGameState();
    expect(Selectors.getAreAllHintsUsed(state)).toBe(false);
    state.ruleset = { hintMode: 'fewer' };
    state.players[0].hint = { used: false };
    expect(Selectors.getAreAllHintsUsed(state)).toBe(false);
  });
  it('returns true if there are no hints remaining', () => {
    const state = createGameState();
    state.ruleset = { hintMode: 'fewer' };
    expect(Selectors.getAreAllHintsUsed(state)).toBe(true);
    state.ruleset = { hintMode: 'default' };
    state.players[1].hint = { used: true };
    state.players[2].hint = { used: true };
    expect(Selectors.getAreAllHintsUsed(state)).toBe(true);
    state.ruleset = { hintMode: 'noTokens' };
    expect(Selectors.getAreAllHintsUsed(state)).toBe(true);
  });
});

describe('getIsBetweenTricks', () => {
  it('returns false if in the middle of a trick', () => {
    expect(Selectors.getIsBetweenTricks(createGameState())).toBe(false);
  });
  it('returns true if a trick was just completed', () => {
    const state = createGameState();
    state.tricks.pop();
    expect(Selectors.getIsBetweenTricks(state)).toBe(true);
  });
  it('returns true if no tricks have started', () => {
    const state = createGameState();
    delete state.tricks;
    expect(Selectors.getIsBetweenTricks(state)).toBe(true);
    state.tricks = [];
    expect(Selectors.getIsBetweenTricks(state)).toBe(true);
  });
});

describe('getPlayerTricksWon', () => {
  it('returns the number of tricks a player has won', () => {
    const state = createGameState();
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
      {
        winner: 1,
        leader: 0,
        cards: [
          { number: 3, suit: 'green' },
          { number: 9, suit: 'blue' },
          { number: 5, suit: 'green' },
        ],
      },
      {
        winner: 1,
        leader: 1,
        cards: [
          { number: 3, suit: 'green' },
          { number: 9, suit: 'blue' },
          { number: 5, suit: 'green' },
        ],
      },
    ];
    expect(Selectors.getPlayerTricksWon(state, 0)).toEqual(1);
    expect(Selectors.getPlayerTricksWon(state, 1)).toEqual(2);
    expect(Selectors.getPlayerTricksWon(state, 2)).toEqual(0);
  });
});

describe('getPlayersTricksWon', () => {
  const trick = {
    leader: 1,
    cards: [
      { number: 3, suit: 'green' },
      { number: 9, suit: 'blue' },
      { number: 5, suit: 'green' },
    ],
  };
  it('returns the number of tricks each player has won', () => {
    const state = createGameState();
    state.tricks = [
      { ...trick, winner: 0 },
      { ...trick, winner: 1 },
      { ...trick, winner: 1 },
      { leader: 1, cards: [{ number: 3, suit: 'green' }] },
    ];
    expect(Selectors.getPlayersTricksWon(state)).toEqual([1, 2, 0]);
  });
  it('returns an array of zeroes if no tricks have been won', () => {
    const state = createGameState();
    state.tricks = [];
    expect(Selectors.getPlayersTricksWon(state)).toEqual([0, 0, 0]);
    const { tricks, ...stateWithoutTricks } = state;
    expect(Selectors.getPlayersTricksWon(stateWithoutTricks)).toEqual([0, 0, 0]);
  });
  it('excludes latest trick if the newest one is not started', () => {
    const state = createGameState();
    state.tricks = [
      { ...trick, winner: 0 },
      { ...trick, winner: 1 },
      { ...trick, winner: 1 },
    ];
    expect(Selectors.getPlayersTricksWon(state)).toEqual([1, 1, 0]);
  });
  it('includes the last trick', () => {
    const state = createGameState();
    state.players.push({});
    state.players.push({});
    const trick5P = {
      leader: 1,
      cards: [
        { number: 3, suit: 'green' },
        { number: 9, suit: 'blue' },
        { number: 5, suit: 'green' },
        { number: 2, suit: 'green' },
        { number: 1, suit: 'green' },
      ],
    };
    state.tricks = [
      { ...trick5P, winner: 0 },
      { ...trick5P, winner: 1 },
      { ...trick5P, winner: 2 },
      { ...trick5P, winner: 3 },
      { ...trick5P, winner: 4 },
      { ...trick5P, winner: 3 },
      { ...trick5P, winner: 2 },
      { ...trick5P, winner: 1 },
    ];
    expect(Selectors.getPlayersTricksWon(state)).toEqual([1, 2, 2, 2, 1]);
  });
});

describe('getLedSuitForCurrentTrick', () => {
  it('returns the led suit of the current trick', () => {
    expect(Selectors.getLedSuitForCurrentTrick(createGameState())).toBe('pink');
  });
  it('is null if between tricks', () => {
    const state = createGameState();
    state.tricks.pop();
    expect(Selectors.getLedSuitForCurrentTrick(state)).toBeNull();
  });
});

describe('getPlayerCardsOfSuit', () => {
  it('returns only cards of a specific suit', () => {
    const state = createGameState();
    expect(Selectors.getPlayerCardsOfSuit(state, 0, 'blue')).toEqual([
      { number: 9, suit: 'blue' },
      { number: 7, suit: 'blue' },
    ]);
    expect(Selectors.getPlayerCardsOfSuit(state, 0, 'green')).toEqual([]);
  });
});

describe('getIsCardLegalToPlay', () => {
  it('returns true if in between tricks', () => {
    const state = createGameState();
    state.tricks.pop();
    expect(Selectors.getIsCardLegalToPlay(state, 1, 0)).toBe(true);
  });
  it('returns true if the card matches the led suit', () => {
    const state = createGameState();
    state.players[1].hand[2].suit = 'pink';
    expect(Selectors.getIsCardLegalToPlay(state, 1, 2)).toBe(true);
  });
  it('returns true if player does not have the led suit', () => {
    const state = createGameState();
    expect(Selectors.getIsCardLegalToPlay(state, 1, 0)).toBe(true);
  });
  it('returns false if not led suit and player has the led suit', () => {
    const state = createGameState();
    state.players[1].hand[2].suit = 'pink';
    expect(Selectors.getIsCardLegalToPlay(state, 1, 0)).toBe(false);
  });
});

describe('getNextPlayerId', () => {
  it('returns the captain if no tricks have been played', () => {
    const state = createGameState();
    delete state.tricks;
    expect(Selectors.getNextPlayerId(state)).toBe(0);
    state.tricks = [];
    state.players[0].isCaptain = false;
    state.players[2].isCaptain = true;
    expect(Selectors.getNextPlayerId(state)).toBe(2);
  });
  it('returns the next player if in the middle of a trick', () => {
    const state = createGameState();
    expect(Selectors.getNextPlayerId(state)).toBe(1);
    state.tricks[1].leader = 1;
    expect(Selectors.getNextPlayerId(state)).toBe(2);
    state.tricks[1].leader = 2;
    expect(Selectors.getNextPlayerId(state)).toBe(0);

    state.tricks.pop();
    state.players.push({});
    expect(Selectors.getNextPlayerId(state)).toBe(0);
    state.tricks[0].leader = 0;
    expect(Selectors.getNextPlayerId(state)).toBe(3);
  });
  it('returns the winner if a trick has just been completed', () => {
    const state = createGameState();
    state.tricks.pop();
    expect(Selectors.getNextPlayerId(state)).toBe(0);
    state.tricks[0].winner = 2;
    expect(Selectors.getNextPlayerId(state)).toBe(2);
  });
  it('throws if a trick has just been completed and there is no winner', () => {
    const state = createGameState();
    state.tricks.pop();
    delete state.tricks[0].winner;
    expect(() => Selectors.getNextPlayerId(state)).toThrow(Error);
  });
});
