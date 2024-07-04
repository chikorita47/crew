import { TASKS_DATA } from '../src/data';
import { Suit, TaskState } from '../src/types';
import { createGameState } from './util';

const testDescriptions = {
  [TaskState.SUCCESS]: 'success state',
  [TaskState.PENDING]: 'pending state',
  [TaskState.FAILURE]: 'failure state',
};

function tricksWithWinners(...winners) {
  return winners.map(winner => ({ winner }));
}

function cards(...properties) {
  if (properties.length % 2) throw new Error('uneven card properties');
  return properties.reduce((acc, property, index) => {
    if (index > 0 && typeof property === typeof properties[index - 1]) {
      throw new Error('Multiple numbers or suits in a row');
    }
    if (index % 2 === 0) {
      acc.push({});
    }
    const accIndex = Math.floor(index / 2);
    if (typeof property === 'number') {
      acc[accIndex].number = property;
    } else {
      acc[accIndex].suit = property;
    }
    return acc;
  }, []);
}

function tricks(...properties) {
  if (properties.length % 3) throw new Error('uneven trick properties');
  return properties.reduce((acc, property, index) => {
    const accIndex = Math.floor(index / 3);
    if (index % 3 === 0) {
      acc.push({ cards: property });
    } else if (index % 3 === 1) {
      acc[accIndex].leader = property;
    } else {
      acc[accIndex].winner = property;
    }
    return acc;
  }, []);
}

function repeat(total, tricks) {
  let array = [];
  for (let i = 0; i < total; i++) {
    array.push(tricks[i % tricks.length]);
  }
  return array;
}

const TESTS = {
  // never win 2 tricks in a row
  0: {
    [TaskState.SUCCESS]: [tricksWithWinners(0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0)],
    [TaskState.PENDING]: [tricksWithWinners(0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1)],
    [TaskState.FAILURE]: [tricksWithWinners(0, 0), tricksWithWinners(1, 0, 0)],
  },
  // not lead green or pink
  1: {
    [TaskState.SUCCESS]: [
      repeat(
        13,
        tricks(
          cards(Suit.BLACK, 4, Suit.BLUE, 9, Suit.YELLOW, 9),
          0,
          0,
          cards(Suit.GREEN, 9, Suit.BLUE, 9, Suit.YELLOW, 9),
          1,
          1,
          cards(Suit.PINK, 9, Suit.BLUE, 9, Suit.YELLOW, 9),
          2,
          2,
        ),
      ),
    ],
    [TaskState.PENDING]: [
      tricks(cards(Suit.BLACK, 4, Suit.BLUE, 9, Suit.YELLOW, 9), 0, 0),
      tricks(cards(Suit.YELLOW, 9, Suit.BLUE, 9, Suit.YELLOW, 9), 0, 0),
      tricks(cards(Suit.BLUE, 9, Suit.BLUE, 8, Suit.YELLOW, 9), 0, 0),
      tricks(cards(Suit.GREEN, 9, Suit.BLUE, 9, Suit.YELLOW, 9), 1, 1),
      tricks(cards(Suit.PINK, 9, Suit.BLUE, 9, Suit.YELLOW, 9), 1, 1),
    ],
    [TaskState.FAILURE]: [
      tricks(cards(Suit.GREEN, 9, Suit.BLUE, 9, Suit.YELLOW, 9), 0, 0),
      tricks(cards(Suit.PINK, 9, Suit.BLUE, 9, Suit.YELLOW, 9), 0, 0),
    ],
  },
  // win 0 tricks
  3: {
    [TaskState.SUCCESS]: [tricksWithWinners(1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1)],
    [TaskState.PENDING]: [tricksWithWinners(1, 2)],
    [TaskState.FAILURE]: [tricksWithWinners(0), tricksWithWinners(1, 0)],
  },
  // win 2 tricks in a row
  4: {
    [TaskState.SUCCESS]: [tricksWithWinners(0, 0), tricksWithWinners(0, 0, 0)],
    [TaskState.PENDING]: [tricksWithWinners(1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0), tricksWithWinners(0, 1, 0)],
    [TaskState.FAILURE]: [tricksWithWinners(0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1)],
  },
  // win 5 with 7
  6: {
    [TaskState.SUCCESS]: [
      tricks(cards(Suit.BLUE, 7, Suit.BLUE, 6, Suit.BLUE, 5), 0, 0),
      tricks(cards(Suit.BLUE, 7, Suit.BLUE, 6, Suit.GREEN, 5), 0, 0), // different suit
      tricks(cards(Suit.BLUE, 6, Suit.BLUE, 7, Suit.GREEN, 5), 2, 0), // not leading
    ],
    [TaskState.PENDING]: [
      tricks(cards(Suit.BLUE, 7, Suit.BLUE, 6, Suit.BLUE, 5), 1, 1), // other player
      tricks(cards(Suit.BLUE, 7, Suit.BLUE, 6, Suit.BLUE, 4), 0, 0), // win no 5 with 7
      tricks(cards(Suit.BLUE, 8, Suit.BLUE, 6, Suit.BLUE, 5), 0, 0), // win 5 without 7
    ],
  },
  // win 6 with another 6
  7: {
    [TaskState.SUCCESS]: [tricks(cards(Suit.BLUE, 6, Suit.GREEN, 6, Suit.BLUE, 5), 0, 0)],
    [TaskState.PENDING]: [
      tricks(cards(Suit.BLUE, 6, Suit.GREEN, 6, Suit.BLUE, 5), 1, 1), // other player
      tricks(cards(Suit.BLUE, 6, Suit.BLUE, 4, Suit.BLUE, 4), 0, 0), // win no other 6
      tricks(cards(Suit.BLUE, 8, Suit.BLUE, 6, Suit.BLUE, 5), 0, 0), // win without 6
    ],
  },
  // win 8 with a 4
  8: {
    [TaskState.SUCCESS]: [tricks(cards(Suit.BLUE, 4, Suit.BLUE, 1, Suit.GREEN, 8), 0, 0)],
    [TaskState.PENDING]: [
      tricks(cards(Suit.BLUE, 4, Suit.BLUE, 1, Suit.GREEN, 8), 1, 1), // other player
      tricks(cards(Suit.BLUE, 4, Suit.BLUE, 1, Suit.GREEN, 9), 0, 0), // win no 8 with 4
      tricks(cards(Suit.BLUE, 5, Suit.BLUE, 1, Suit.GREEN, 8), 0, 0), // win 8 without 4
      tricks(cards(Suit.BLACK, 4, Suit.BLUE, 1, Suit.GREEN, 8), 0, 0), // black should be excluded
    ],
  },
  // win trick with only evens
  9: {
    [TaskState.SUCCESS]: [tricks(cards(Suit.BLUE, 8, Suit.GREEN, 6, Suit.PINK, 4), 0, 0)],
    [TaskState.PENDING]: [
      tricks(cards(Suit.BLUE, 8, Suit.GREEN, 6, Suit.PINK, 5), 0, 0),
      tricks(cards(Suit.BLACK, 4, Suit.BLUE, 4, Suit.BLUE, 4), 0, 0), // black should be excluded
    ],
  },
  // win trick with 2
  11: {
    [TaskState.SUCCESS]: [
      tricks(cards(Suit.BLUE, 2, Suit.GREEN, 9, Suit.PINK, 9), 0, 0),
      tricks(cards(Suit.BLUE, 1, Suit.BLUE, 2, Suit.PINK, 9), 2, 0), // other player leads
    ],
    [TaskState.PENDING]: [
      tricks(cards(Suit.BLUE, 2, Suit.BLUE, 9, Suit.PINK, 9), 0, 1), // other player wins
      tricks(cards(Suit.BLUE, 9, Suit.BLUE, 2, Suit.PINK, 9), 0, 0), // did not play the 2
      tricks(cards(Suit.BLACK, 2, Suit.GREEN, 9, Suit.PINK, 9), 0, 0), // black should be excluded
    ],
  },
  // all values less than 7
  16: {
    [TaskState.SUCCESS]: [tricks(cards(Suit.BLUE, 6, Suit.GREEN, 5, Suit.PINK, 4), 0, 0)],
    [TaskState.PENDING]: [
      tricks(cards(Suit.BLUE, 6, Suit.GREEN, 7, Suit.PINK, 4), 0, 0), // includes a 7
      tricks(cards(Suit.BLACK, 4, Suit.GREEN, 5, Suit.PINK, 4), 0, 0), // black should be excluded
    ],
  },
  // total value less than 8/12/16
  18: {
    [TaskState.SUCCESS]: {
      '3P': [
        tricks(cards(Suit.BLUE, 3, Suit.GREEN, 2, Suit.PINK, 2), 0, 0),
        tricks(cards(Suit.BLUE, 3, Suit.GREEN, 2, Suit.PINK, 1), 0, 0),
      ],
      '4P': [tricks(cards(Suit.BLUE, 3, Suit.GREEN, 3, Suit.PINK, 3, Suit.YELLOW, 2), 0, 0)],
      '5P': [tricks(cards(Suit.BLUE, 3, Suit.GREEN, 3, Suit.PINK, 3, Suit.YELLOW, 3, Suit.BLUE, 3), 0, 0)],
    },
    [TaskState.PENDING]: [
      tricks(cards(Suit.BLUE, 3, Suit.GREEN, 3, Suit.PINK, 2), 0, 0), // too large
      tricks(cards(Suit.BLACK, 3, Suit.GREEN, 2, Suit.PINK, 2), 0, 0), // black should be excluded
    ],
  },
  // as many green as yellow in one trick
  20: {
    [TaskState.SUCCESS]: {
      '3P': [
        tricks(cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.YELLOW, 9), 0, 0),
        tricks(cards(Suit.GREEN, 9, Suit.BLUE, 9, Suit.YELLOW, 9), 0, 0),
        tricks(cards(Suit.BLACK, 4, Suit.GREEN, 9, Suit.YELLOW, 9), 0, 0),
      ],
      '4P': [tricks(cards(Suit.GREEN, 9, Suit.GREEN, 8, Suit.YELLOW, 9, Suit.YELLOW, 8), 0, 0)],
      '5P': [tricks(cards(Suit.GREEN, 9, Suit.GREEN, 8, Suit.YELLOW, 9, Suit.YELLOW, 8, Suit.BLUE, 9), 0, 0)],
    },
    [TaskState.PENDING]: [
      tricks(cards(Suit.GREEN, 9, Suit.YELLOW, 9, Suit.YELLOW, 8), 0, 0), // uneven amount
      tricks(cards(Suit.BLUE, 9, Suit.BLUE, 8, Suit.PINK, 9), 0, 0), // 0 green/yellow
    ],
  },
  // as many pink as yellow
  22: {
    [TaskState.SUCCESS]: [
      [
        ...repeat(
          12,
          tricks(
            cards(Suit.PINK, 9, Suit.BLUE, 9, Suit.GREEN, 9),
            0,
            0,
            cards(Suit.GREEN, 9, Suit.GREEN, 9, Suit.YELLOW, 9),
            0,
            0,
          ),
        ),
        ...tricks(cards(Suit.BLACK, 4, Suit.BLUE, 9, Suit.GREEN, 9), 0, 0),
      ],
    ],
    [TaskState.PENDING]: [
      repeat(
        12,
        tricks(
          cards(Suit.PINK, 9, Suit.BLUE, 9, Suit.GREEN, 9),
          0,
          0,
          cards(Suit.GREEN, 9, Suit.GREEN, 9, Suit.YELLOW, 9),
          0,
          0,
        ),
      ),
    ],
    [TaskState.FAILURE]: [
      repeat(13, tricks(cards(Suit.PINK, 9, Suit.PINK, 9, Suit.YELLOW, 9), 0, 0)), // uneven amount
      repeat(13, tricks(cards(Suit.BLUE, 9, Suit.BLUE, 9, Suit.GREEN, 9), 0, 0)), // 0 pink/yellow
    ],
  },
  // all cards in at least one color (test taskUnion)
  26: {
    [TaskState.SUCCESS]: [
      [
        ...tricks(
          cards(Suit.BLUE, 9, Suit.BLUE, 8, Suit.BLUE, 7),
          0,
          0,
          cards(Suit.BLUE, 6, Suit.BLUE, 5, Suit.BLUE, 4),
          0,
          0,
          cards(Suit.BLUE, 3, Suit.BLUE, 2, Suit.BLUE, 1),
          0,
          0,
        ),
        ...repeat(10, tricks(cards(Suit.PINK, 9, Suit.PINK, 9, Suit.YELLOW, 9), 1, 1)),
      ],
      tricks(
        cards(Suit.BLUE, 9, Suit.BLUE, 8, Suit.BLUE, 7),
        0,
        0,
        cards(Suit.BLUE, 6, Suit.BLUE, 5, Suit.BLUE, 4),
        0,
        0,
        cards(Suit.BLUE, 3, Suit.BLUE, 2, Suit.BLUE, 1),
        0,
        0,
      ),
    ],
    [TaskState.PENDING]: [
      tricks(
        cards(Suit.BLUE, 9, Suit.BLUE, 8, Suit.BLUE, 7),
        0,
        0,
        cards(Suit.BLUE, 6, Suit.BLUE, 5, Suit.BLUE, 4),
        0,
        0,
        cards(Suit.BLUE, 3, Suit.BLUE, 2, Suit.GREEN, 1),
        0,
        0,
      ),
    ],
    [TaskState.FAILURE]: [
      [
        ...tricks(
          cards(Suit.BLUE, 9, Suit.BLUE, 8, Suit.BLUE, 7),
          0,
          0,
          cards(Suit.BLUE, 6, Suit.BLUE, 5, Suit.BLUE, 4),
          0,
          0,
          cards(Suit.BLUE, 3, Suit.BLUE, 2, Suit.GREEN, 1),
          0,
          0,
        ),
        ...repeat(10, tricks(cards(Suit.PINK, 9, Suit.PINK, 9, Suit.YELLOW, 9), 1, 1)),
      ],
    ],
  },
  // at least 2 7s
  27: {
    [TaskState.SUCCESS]: [
      // across multiple tricks
      tricks(
        cards(Suit.BLUE, 6, Suit.GREEN, 7, Suit.PINK, 5),
        0,
        0,
        cards(Suit.BLUE, 7, Suit.GREEN, 4, Suit.PINK, 3),
        0,
        0,
      ),
      tricks(cards(Suit.BLUE, 7, Suit.GREEN, 7, Suit.PINK, 7), 0, 0), // more than 2
    ],
    [TaskState.PENDING]: [
      tricks(cards(Suit.BLUE, 7, Suit.GREEN, 7, Suit.BLUE, 5), 1, 1), // other player
      tricks(cards(Suit.BLUE, 6, Suit.GREEN, 7, Suit.PINK, 5), 0, 0), // only one
    ],
    [TaskState.FAILURE]: [
      // only one, all tricks played out
      [
        ...tricks(cards(Suit.BLUE, 6, Suit.GREEN, 7, Suit.PINK, 5), 0, 0),
        ...repeat(12, tricks(cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.PINK, 9), 0, 0)),
      ],
    ],
  },
  // win all 4 3s
  30: {
    [TaskState.SUCCESS]: [
      [
        ...tricks(
          cards(Suit.BLUE, 3, Suit.GREEN, 3, Suit.PINK, 3),
          0,
          0,
          cards(Suit.YELLOW, 3, Suit.GREEN, 9, Suit.PINK, 9),
          0,
          0,
        ),
        ...repeat(11, tricks(cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.PINK, 9), 0, 0)),
      ],
      tricks(
        cards(Suit.BLUE, 3, Suit.GREEN, 3, Suit.PINK, 3),
        0,
        0,
        cards(Suit.YELLOW, 3, Suit.GREEN, 9, Suit.PINK, 9),
        0,
        0,
      ),
    ],
    [TaskState.PENDING]: [
      // black should be excluded
      tricks(
        cards(Suit.BLUE, 3, Suit.GREEN, 3, Suit.PINK, 3),
        0,
        0,
        cards(Suit.BLACK, 3, Suit.GREEN, 9, Suit.PINK, 9),
        0,
        0,
      ),
    ],
    [TaskState.FAILURE]: [
      // black should be excluded
      [
        ...tricks(
          cards(Suit.BLUE, 3, Suit.GREEN, 3, Suit.PINK, 3),
          0,
          0,
          cards(Suit.BLACK, 3, Suit.GREEN, 9, Suit.PINK, 9),
          0,
          0,
        ),
        ...repeat(11, tricks(cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.PINK, 9), 0, 0)),
      ],
    ],
  },
  // win exactly 2 tricks
  35: {
    [TaskState.SUCCESS]: [
      tricksWithWinners(0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
      tricksWithWinners(0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0),
    ],
    [TaskState.PENDING]: [tricksWithWinners(0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1)],
    [TaskState.FAILURE]: [tricksWithWinners(0, 0, 0), tricksWithWinners(0, 1, 0, 1, 0)],
  },
  // win exactly 1 pink
  39: {
    [TaskState.SUCCESS]: [
      [
        ...tricks(cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.PINK, 9), 0, 0),
        ...repeat(12, tricks(cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.YELLOW, 9), 0, 0)),
      ],
      [
        ...tricks(cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.PINK, 9), 0, 0),
        ...repeat(12, tricks(cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.PINK, 9), 0, 1)),
      ],
    ],
    [TaskState.PENDING]: [
      [
        ...tricks(cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.PINK, 9), 0, 0),
        ...repeat(11, tricks(cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.YELLOW, 9), 0, 0)),
      ],
    ],
    [TaskState.FAILURE]: [
      tricks(cards(Suit.BLUE, 9, Suit.PINK, 9, Suit.PINK, 8), 0, 0), // 2 pink
      repeat(13, tricks(cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.YELLOW, 9), 0, 0)), // no pink
    ],
  },
  // win exactly 1 black
  43: {
    [TaskState.SUCCESS]: [
      [
        ...tricks(cards(Suit.BLACK, 1, Suit.GREEN, 9, Suit.PINK, 9), 0, 0),
        ...repeat(12, tricks(cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.PINK, 9), 0, 0)),
      ],
      [
        ...tricks(cards(Suit.BLACK, 1, Suit.GREEN, 9, Suit.PINK, 9), 0, 0),
        ...repeat(12, tricks(cards(Suit.BLACK, 4, Suit.GREEN, 9, Suit.PINK, 9), 0, 1)),
      ],
    ],
    [TaskState.PENDING]: [
      [
        ...tricks(cards(Suit.BLACK, 1, Suit.GREEN, 9, Suit.PINK, 9), 0, 0),
        ...repeat(11, tricks(cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.PINK, 9), 0, 0)),
      ],
    ],
    [TaskState.FAILURE]: [
      tricks(cards(Suit.BLACK, 3, Suit.BLACK, 2, Suit.PINK, 9), 0, 0), // 2 black
      repeat(13, tricks(cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.PINK, 9), 0, 0)), // no black
    ],
  },
  // win exactly 2 9s
  46: {
    [TaskState.SUCCESS]: [
      [
        ...tricks(cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.PINK, 1), 0, 0),
        ...repeat(12, tricks(cards(Suit.BLUE, 1, Suit.GREEN, 1, Suit.PINK, 1), 0, 0)),
      ],
    ],
    [TaskState.PENDING]: [
      [
        ...tricks(cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.PINK, 1), 0, 0),
        ...repeat(11, tricks(cards(Suit.BLUE, 1, Suit.GREEN, 1, Suit.PINK, 1), 0, 0)),
      ],
    ],
    [TaskState.FAILURE]: [
      tricks(cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.PINK, 9), 0, 0), // more than two
      [
        ...tricks(cards(Suit.BLUE, 9, Suit.GREEN, 1, Suit.PINK, 1), 0, 0), // only one
        ...repeat(12, tricks(cards(Suit.BLUE, 1, Suit.GREEN, 1, Suit.PINK, 1), 0, 0)),
      ],
    ],
  },
  // more tricks than anyone else
  49: {
    [TaskState.SUCCESS]: [
      tricksWithWinners(0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0),
      tricksWithWinners(0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2),
    ],
    [TaskState.PENDING]: [tricksWithWinners(0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1), tricksWithWinners(0, 0, 0, 0, 0, 0)],
    [TaskState.FAILURE]: [
      tricksWithWinners(0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1), // too few
      tricksWithWinners(0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2), // tie
    ],
  },
  // more tricks than anyone else combined
  50: {
    [TaskState.SUCCESS]: [
      tricksWithWinners(0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0),
      tricksWithWinners(0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2),
    ],
    [TaskState.PENDING]: [tricksWithWinners(0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1), tricksWithWinners(0, 0, 0, 0, 0, 0)],
    [TaskState.FAILURE]: [
      tricksWithWinners(0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1), // too few
      tricksWithWinners(0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2), // tie
      tricksWithWinners(0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2), // fewer than half
    ],
  },
  // fewer tricks than the captain
  52: {
    [TaskState.SUCCESS]: {
      captainP1: [
        tricksWithWinners(0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1),
        tricksWithWinners(0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2),
      ],
    },
    [TaskState.PENDING]: {
      captainP1: [tricksWithWinners(0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1), tricksWithWinners(0, 0, 0, 0, 0, 0)],
    },
    [TaskState.FAILURE]: {
      captainP1: [
        tricksWithWinners(0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1), // too many
        tricksWithWinners(0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2), // tie
      ],
    },
  },
  // win no 1s
  54: {
    [TaskState.SUCCESS]: [
      repeat(13, tricks(cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.PINK, 9), 0, 0)),
      repeat(13, tricks(cards(Suit.BLUE, 1, Suit.GREEN, 1, Suit.PINK, 1), 0, 1)),
    ],
    [TaskState.PENDING]: [
      repeat(12, tricks(cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.PINK, 9), 0, 0)),
      repeat(12, tricks(cards(Suit.BLUE, 1, Suit.GREEN, 1, Suit.PINK, 1), 0, 1)),
    ],
    [TaskState.FAILURE]: [tricks(cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.PINK, 1), 0, 0)],
  },
  // none of the first 3 tricks
  65: {
    [TaskState.SUCCESS]: [tricksWithWinners(1, 2, 1), tricksWithWinners(1, 1, 1, 0)],
    [TaskState.PENDING]: [tricksWithWinners(1, 2)],
    [TaskState.FAILURE]: [tricksWithWinners(0), tricksWithWinners(1, 0), tricksWithWinners(1, 2, 0)],
  },
  // only the last trick
  69: {
    [TaskState.SUCCESS]: {
      '3P': [tricksWithWinners(1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 0)],
      '4P': [tricksWithWinners(1, 1, 1, 2, 2, 2, 3, 3, 3, 0)],
      '5P': [tricksWithWinners(1, 1, 2, 2, 3, 3, 4, 0)],
    },
    [TaskState.PENDING]: [tricksWithWinners(1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2)],
    [TaskState.FAILURE]: [
      tricksWithWinners(1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2), // no tricks
      tricksWithWinners(1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 0, 0), // multiple tricks
      tricksWithWinners(1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 0, 2), // other trick
      tricksWithWinners(0), // other trick before game ends -- weird special case
    ],
  },
  // win the black 3 (specific card)
  77: {
    [TaskState.SUCCESS]: [tricks(cards(Suit.BLACK, 4, Suit.BLACK, 3, Suit.PINK, 9), 0, 0)],
    [TaskState.PENDING]: [
      tricks(cards(Suit.BLUE, 9, Suit.GREEN, 3, Suit.PINK, 9), 0, 0), // different 3
      tricks(cards(Suit.BLACK, 4, Suit.GREEN, 9, Suit.PINK, 9), 0, 0), // different black
    ],
    [TaskState.FAILURE]: [tricks(cards(Suit.BLACK, 4, Suit.BLACK, 3, Suit.PINK, 9), 1, 1)], // someone else wins
  },
  // win blue 6 and yellow 7
  80: {
    [TaskState.SUCCESS]: [
      tricks(cards(Suit.BLUE, 6, Suit.YELLOW, 7, Suit.PINK, 9), 0, 0), // one trick
      // multiple tricks
      tricks(
        cards(Suit.BLUE, 6, Suit.GREEN, 9, Suit.PINK, 9),
        0,
        0,
        cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.YELLOW, 7),
        0,
        0,
      ),
    ],
    [TaskState.PENDING]: [
      tricks(cards(Suit.BLUE, 6, Suit.GREEN, 9, Suit.PINK, 9), 0, 0), // one but not the other
    ],
    [TaskState.FAILURE]: [
      tricks(cards(Suit.BLUE, 6, Suit.GREEN, 9, Suit.PINK, 9), 1, 1), // someone else wins one
      tricks(cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.YELLOW, 7), 1, 1), // someone else wins other
    ],
  },
  // win pink 7 with a black
  91: {
    [TaskState.SUCCESS]: [
      tricks(cards(Suit.BLACK, 4, Suit.GREEN, 9, Suit.PINK, 7), 0, 0),
      tricks(cards(Suit.GREEN, 9, Suit.BLACK, 4, Suit.PINK, 7), 2, 0),
    ],
    [TaskState.PENDING]: [
      tricks(cards(Suit.BLACK, 4, Suit.GREEN, 9, Suit.BLUE, 7), 0, 0), // different 7
      tricks(cards(Suit.BLACK, 4, Suit.GREEN, 9, Suit.PINK, 9), 0, 0), // different pink
    ],
    [TaskState.FAILURE]: [
      tricks(cards(Suit.BLACK, 4, Suit.GREEN, 9, Suit.PINK, 7), 1, 1), // someone else wins
      tricks(cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.PINK, 7), 1, 1), // win pink 7 without black
    ],
  },
  // win green 2 in final trick
  93: {
    [TaskState.SUCCESS]: [
      [
        ...repeat(12, tricks(cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.PINK, 9), 0, 0)),
        ...tricks(cards(Suit.BLUE, 9, Suit.GREEN, 2, Suit.PINK, 9), 0, 0),
      ],
    ],
    [TaskState.PENDING]: [repeat(12, tricks(cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.PINK, 9), 0, 0))],
    [TaskState.FAILURE]: [
      // someone else wins
      [
        ...repeat(12, tricks(cards(Suit.BLUE, 9, Suit.GREEN, 9, Suit.PINK, 9), 0, 0)),
        ...tricks(cards(Suit.BLUE, 9, Suit.GREEN, 2, Suit.PINK, 9), 1, 1),
      ],
      tricks(cards(Suit.BLUE, 9, Suit.GREEN, 2, Suit.PINK, 9), 0, 0), // win too early
    ],
  },
};

for (const [taskId, testStatesByResult] of Object.entries(TESTS)) {
  describe(`task ${taskId}`, () => {
    const test = TASKS_DATA[taskId].test;
    for (const [result, testStates] of Object.entries(testStatesByResult)) {
      it(testDescriptions[result], () => {
        if (Array.isArray(testStates)) {
          if (!testStates.length) throw new Error('No tests');
          for (const testState of testStates) {
            const state = createGameState();
            state.tricks = testState;
            expect(test(state, 0)).toBe(~~result);
          }
        } else {
          for (const [condition, testStatesForCondition] of Object.entries(testStates)) {
            if (!testStatesForCondition.length) throw new Error('No tests');
            for (const testState of testStatesForCondition) {
              const state = createGameState();
              if (condition === '3P') {
                // do nothing
              } else if (condition === '4P') {
                state.players.push({});
              } else if (condition === '5P') {
                state.players.push({});
                state.players.push({});
              } else if (condition === 'captainP1') {
                state.players[0].isCaptain = false;
                state.players[1].isCaptain = true;
              }
              state.tricks = testState;
              expect(test(state, 0)).toBe(~~result);
            }
          }
        }
      });
    }
  });
}

for (const taskId of [94, 95]) {
  describe(`task ${taskId}`, () => {
    const state = createGameState();
    const test = TASKS_DATA[taskId].test;
    it('success state', () => {
      state.players[0].tasks[taskId] = { id: taskId, data: { n: 0 } };
      state.tricks = tricksWithWinners(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);
      expect(test(state, 0)).toBe(TaskState.SUCCESS);
      state.players[0].tasks[taskId] = { id: taskId, data: { n: 4 } };
      state.tricks = tricksWithWinners(1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 0, 0, 0);
      expect(test(state, 0)).toBe(TaskState.SUCCESS);
    });
    it('pending state', () => {
      state.players[0].tasks[taskId] = { id: taskId, data: { n: 0 } };
      state.tricks = tricksWithWinners(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);
      expect(test(state, 0)).toBe(TaskState.PENDING);
      state.players[0].tasks[taskId] = { id: taskId, data: { n: 4 } };
      state.tricks = tricksWithWinners(1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 0, 0);
      expect(test(state, 0)).toBe(TaskState.PENDING);
    });
    it('failure state', () => {
      state.players[0].tasks[taskId] = { id: taskId, data: { n: 0 } };
      state.tricks = tricksWithWinners(0);
      expect(test(state, 0)).toBe(TaskState.FAILURE);
      state.players[0].tasks[taskId] = { id: taskId, data: { n: 4 } };
      state.tricks = tricksWithWinners(0, 0, 0, 0, 0); // too many
      expect(test(state, 0)).toBe(TaskState.FAILURE);
      state.tricks = tricksWithWinners(1, 1, 1, 1, 1, 1, 1, 1, 1, 1); // not enough left
      expect(test(state, 0)).toBe(TaskState.FAILURE);
    });
  });
}

describe('task_notOpenTrickWithCardProperty checking player hand', () => {
  const test = TASKS_DATA[1].test;
  it('should fail early if player hand contains only invalid cards and they must lead', () => {
    const state = createGameState();
    state.players[1].tasks[1] = { id: 1 };
    state.tricks = tricks(cards(Suit.GREEN, 9, Suit.BLUE, 9, Suit.YELLOW, 9), 0, 1);
    expect(test(state, 1)).toBe(TaskState.FAILURE);
  });
  it('should not fail if player hand contains only one invalid card and is the extra card', () => {
    const state = createGameState();
    state.players[1].tasks[1] = { id: 1 };
    state.players[1].extraCards = 1;
    state.players[1].hand = [{ number: 1, suit: Suit.GREEN }];
    state.tricks = repeat(13, tricks(cards(Suit.GREEN, 9, Suit.BLUE, 9, Suit.YELLOW, 9), 0, 1));
    expect(test(state, 1)).toBe(TaskState.SUCCESS);
  });
});
