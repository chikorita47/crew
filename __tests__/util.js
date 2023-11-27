export function createGameState() {
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
          { number: 9, suit: 'blue' },
          { number: 5, suit: 'green' },
        ],
      },
      {
        leader: 0,
        cards: [
          { number: 4, suit: 'pink' },
        ],
      },
    ],
  };
}
