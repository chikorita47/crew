import * as Selectors from '../src/selectors';

function createGameState() {
  return {
    players: [
      {
        id: 0,
        key: 'AAAA',
        name: 'Nathan',
        hand: [{ number: 4, suit: 'black' }, { number: 9, suit: 'blue' }, { number: 7, suit: 'blue' }],
        hint: { used: true, card: { number: 9, suit: 'blue' }, placement: 'top' },
        tasks: { 23: { id: 23, done: false }, 14: { id: 14, done: true } },
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
        tasks: {},
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

describe('getUnassignedTasksExist', () => {
  it('returns true if unassigned tasks exist', () => {
    const state = createGameState();
    state.unassignedTasks = {
      '4': { id: 4, provisionalPlayerId: 0 },
      '5': { id: 5 }
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
      '4': { id: 4, provisionalPlayerId: 0 },
      '5': { id: 5 }
    };
    expect(Selectors.getAreAllTasksAssigned(state)).toBe(false);
  });
  it('returns true if all tasks are assigned', () => {
    const state = createGameState();
    state.unassignedTasks = {
      '4': { id: 4, provisionalPlayerId: 0 },
      '5': { id: 5, provisionalPlayerId: 1 }
    };
    expect(Selectors.getAreAllTasksAssigned(state)).toBe(true);
  });
  it('returns false if unassignedTasks is empty', () => {
    const state = createGameState();
    expect(Selectors.getAreAllTasksAssigned(state)).toBe(false);
    state.unassignedTasks = {};
    expect(Selectors.getAreAllTasksAssigned(state)).toBe(false);
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
  xit('returns true if a task has failed', () => {
    expect(false).toBe(true);
  });
});

describe('getAreAllTasksDone', () => {
  it('returns false if any player has unfinished tasks', () => {
    expect(Selectors.getAreAllTasksDone(createGameState())).toBe(false);
  });
  it('returns true if no player has unfinished tasks', () => {
    const state = createGameState();
    state.players[0].tasks[23].done = true;
    expect(Selectors.getAreAllTasksDone(state)).toBe(true);
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
    expect(Selectors.getPlayerCardsOfSuit(state, 0, 'blue')).toEqual([{ number: 9, suit: 'blue' }, { number: 7, suit: 'blue' }]);
    expect(Selectors.getPlayerCardsOfSuit(state, 0, 'green')).toEqual([]);
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
