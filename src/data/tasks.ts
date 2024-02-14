import {
  CAPTAIN,
  LAST_TRICK,
  task_winCardCountWithProperty,
  task_winComparativeTrickCount,
  task_winConsecutiveTricks,
  task_winExactTrickCount,
  task_winNthTrick,
  task_winSpecificCard,
  task_winTrickPassingAggregateTest,
  task_winTrickPassingCardTest,
  task_winTrickUsingCard,
  task_winTrickWithValueComparison,
  task_winComparativeCardCountForProperties,
  task_notOpenTrickWithCardProperty,
  taskIntersection,
  taskUnion,
  trickContains,
  getMaxTrickCount,
  getMostRecentTrick,
  getNumTricksWonByPlayer,
  getRemainingTrickCount,
} from './helpers';
import { getNumberOfPlayers, getTaskDataForPlayer } from '../selectors';
import { Comparison, Suit, TasksData, TaskState } from '../types';

export default {
  '0': {
    id: 0,
    text: 'I will never win 2 tricks in a row',
    subtext: '',
    difficulty: [3, 2, 2],
    test: (state, owner) => {
      const numTricks = state.tricks?.length || 0;
      const trick = getMostRecentTrick(state);
      const prevTrick = numTricks > 1 ? state.tricks?.[numTricks - 2] : undefined;

      if (trick?.winner === owner && prevTrick?.winner === owner) {
        return TaskState.FAILURE;
      }
      if (numTricks === getMaxTrickCount(state)) {
        return TaskState.SUCCESS;
      }
      return TaskState.PENDING;
    },
  },
  '1': {
    id: 1,
    text: 'I will not open a trick with pink or green',
    subtext: '',
    difficulty: [2, 1, 1],
    test: taskIntersection(task_notOpenTrickWithCardProperty(Suit.GREEN), task_notOpenTrickWithCardProperty(Suit.PINK)),
  },
  '2': {
    id: 2,
    text: 'I will not open a trick with pink, yellow, or blue',
    subtext: '',
    difficulty: [4, 3, 3],
    test: taskIntersection(
      task_notOpenTrickWithCardProperty(Suit.PINK),
      task_notOpenTrickWithCardProperty(Suit.YELLOW),
      task_notOpenTrickWithCardProperty(Suit.BLUE),
    ),
  },
  '3': {
    id: 3,
    text: 'I will win 0 tricks',
    subtext: '',
    difficulty: [4, 3, 3],
    test: task_winExactTrickCount(0),
  },
  '4': {
    id: 4,
    text: 'I will win 2 tricks in a row',
    subtext: '',
    difficulty: [1, 1, 1],
    test: task_winConsecutiveTricks(2),
  },
  '5': {
    id: 5,
    text: 'I will win 3 tricks in a row',
    subtext: '',
    difficulty: [2, 3, 4],
    test: task_winConsecutiveTricks(3),
  },
  '6': {
    id: 6,
    text: 'I will win a 5 with a 7',
    subtext: '',
    difficulty: [1, 2, 2],
    test: task_winTrickUsingCard(7, trickContains(5)),
  },
  '7': {
    id: 7,
    text: 'I will win a 6 with another 6',
    subtext: '',
    difficulty: [2, 3, 4],
    test: task_winTrickUsingCard(6, trickContains(6, 2)),
  },
  '8': {
    id: 8,
    text: 'I will win an 8 with a 4',
    subtext: '',
    difficulty: [3, 4, 5],
    test: task_winTrickUsingCard(4, trickContains(8)),
  },
  '9': {
    id: 9,
    text: 'I will win a trick that contains only even-numbered cards',
    subtext: 'Submarines are not allowed in the trick',
    difficulty: [2, 5, 6],
    test: task_winTrickPassingCardTest(c => c.number % 2 === 0 && c.suit !== Suit.BLACK),
  },
  '10': {
    id: 10,
    text: 'I will win a trick that contains only odd-numbered cards',
    subtext: 'Submarines are not allowed in the trick',
    difficulty: [2, 4, 5],
    test: task_winTrickPassingCardTest(c => c.number % 2 === 1 && c.suit !== Suit.BLACK),
  },
  '11': {
    id: 11,
    text: 'I will win a trick using a 2',
    subtext: '',
    difficulty: [3, 4, 5],
    test: task_winTrickUsingCard(2),
  },
  '12': {
    id: 12,
    text: 'I will win a trick using a 3',
    subtext: '',
    difficulty: [3, 4, 5],
    test: task_winTrickUsingCard(3),
  },
  '13': {
    id: 13,
    text: 'I will win a trick using a 5',
    subtext: '',
    difficulty: [2, 3, 4],
    test: task_winTrickUsingCard(5),
  },
  '14': {
    id: 14,
    text: 'I will win a trick using a 6',
    subtext: '',
    difficulty: [2, 3, 3],
    test: task_winTrickUsingCard(6),
  },
  '15': {
    id: 15,
    text: 'I will win a trick of which the card values are all greater than 5',
    subtext: '',
    difficulty: [2, 3, 4],
    test: task_winTrickPassingCardTest(c => c.number > 5),
  },
  '16': {
    id: 16,
    text: 'I will win a trick of which the card values are all less than 7',
    subtext: 'Submarines are not allowed in the trick',
    difficulty: [2, 3, 3],
    test: task_winTrickPassingCardTest(c => c.number < 7 && c.suit !== Suit.BLACK),
  },
  '17': {
    id: 17,
    text: 'I will win a trick with a total value greater than 23/28/31',
    subtext: 'Submarines are not allowed in the trick',
    difficulty: [3, 3, 4],
    test: (state, owner) => {
      const numberOfPlayers = getNumberOfPlayers(state);
      const valueByNumberOfPlayers: { [key: number]: number } = {
        [3]: 23,
        [4]: 28,
        [5]: 31,
      };
      return taskIntersection(
        task_winTrickWithValueComparison(valueByNumberOfPlayers[numberOfPlayers], Comparison.MORE_THAN),
        task_winTrickPassingCardTest(c => c.suit !== Suit.BLACK),
      )(state, owner);
    },
  },
  '18': {
    id: 18,
    text: 'I will win a trick with a total value less than 8/12/16',
    subtext: 'Submarines are not allowed in the trick',
    difficulty: [3, 3, 4],
    test: (state, owner) => {
      const numberOfPlayers = getNumberOfPlayers(state);
      const valueByNumberOfPlayers: { [key: number]: number } = {
        [3]: 8,
        [4]: 12,
        [5]: 16,
      };
      return taskIntersection(
        task_winTrickWithValueComparison(valueByNumberOfPlayers[numberOfPlayers], Comparison.FEWER_THAN),
        task_winTrickPassingCardTest(c => c.suit !== Suit.BLACK),
      )(state, owner);
    },
  },
  '19': {
    id: 19,
    text: 'I will win a trick with a total value of 22 or 23',
    subtext: 'Submarines are not allowed in the trick',
    difficulty: [3, 3, 4],
    test: taskIntersection(
      taskUnion(
        task_winTrickWithValueComparison(22, Comparison.EQUAL_TO),
        task_winTrickWithValueComparison(23, Comparison.EQUAL_TO),
      ),
      task_winTrickPassingCardTest(c => c.suit !== Suit.BLACK),
    ),
  },
  '20': {
    id: 20,
    text: 'I will win as many green as yellow cards in one trick',
    subtext: '0 green/yellow cards is not allowed',
    difficulty: [2, 3, 3],
    test: task_winTrickPassingAggregateTest(cards => {
      const green = cards.filter(c => c.suit === Suit.GREEN).length;
      const yellow = cards.filter(c => c.suit === Suit.YELLOW).length;
      return green === yellow && green !== 0;
    }),
  },
  '21': {
    id: 21,
    text: 'I will win as many pink as blue cards in one trick',
    subtext: '0 pink/blue cards is not allowed',
    difficulty: [2, 3, 3],
    test: task_winTrickPassingAggregateTest(cards => {
      const pink = cards.filter(c => c.suit === Suit.PINK).length;
      const blue = cards.filter(c => c.suit === Suit.BLUE).length;
      return pink === blue && pink !== 0;
    }),
  },
  '22': {
    id: 22,
    text: 'I will win as many pink as yellow cards',
    subtext: '0 pink/yellow cards is not allowed',
    difficulty: [4, 4, 4],
    test: taskIntersection(
      task_winComparativeCardCountForProperties(Suit.PINK, Comparison.EQUAL_TO, Suit.YELLOW),
      task_winCardCountWithProperty(1, Suit.PINK, false),
    ),
  },
  '23': {
    id: 23,
    text: 'I will win more pink than green cards',
    subtext: '0 green cards is allowed',
    difficulty: [1, 1, 1],
    test: task_winComparativeCardCountForProperties(Suit.PINK, Comparison.MORE_THAN, Suit.GREEN),
  },
  '24': {
    id: 24,
    text: 'I will win more yellow than blue cards',
    subtext: '0 blue cards is allowed',
    difficulty: [1, 1, 1],
    test: task_winComparativeCardCountForProperties(Suit.YELLOW, Comparison.MORE_THAN, Suit.BLUE),
  },
  '25': {
    id: 25,
    text: 'I will win at least one card of each color',
    subtext: '',
    difficulty: [2, 3, 4],
    test: taskIntersection(
      task_winCardCountWithProperty(1, Suit.BLUE, false),
      task_winCardCountWithProperty(1, Suit.GREEN, false),
      task_winCardCountWithProperty(1, Suit.YELLOW, false),
      task_winCardCountWithProperty(1, Suit.PINK, false),
    ),
  },
  '26': {
    id: 26,
    text: 'I will win all the cards in at least one of the 4 colors',
    subtext: '',
    difficulty: [3, 4, 5],
    test: taskUnion(
      task_winCardCountWithProperty(9, Suit.BLUE, true),
      task_winCardCountWithProperty(9, Suit.GREEN, true),
      task_winCardCountWithProperty(9, Suit.YELLOW, true),
      task_winCardCountWithProperty(9, Suit.PINK, true),
    ),
  },
  '27': {
    id: 27,
    text: 'I will win at least 2x 7s',
    subtext: '',
    difficulty: [2, 2, 2],
    test: task_winCardCountWithProperty(2, 7, false),
  },
  '28': {
    id: 28,
    text: 'I will win at least 3x 5s',
    subtext: '',
    difficulty: [3, 4, 5],
    test: task_winCardCountWithProperty(3, 5, false),
  },
  '29': {
    id: 29,
    text: 'I will win at least 3x 9s',
    subtext: '',
    difficulty: [3, 4, 5],
    test: task_winCardCountWithProperty(3, 9, false),
  },
  '30': {
    id: 30,
    text: 'I will win all 4x 3s',
    subtext: '',
    difficulty: [3, 4, 5],
    test: task_winCardCountWithProperty(4, 3, true),
  },
  '31': {
    id: 31,
    text: 'I will win all 4x 9s',
    subtext: '',
    difficulty: [4, 5, 6],
    test: task_winCardCountWithProperty(4, 9, true),
  },
  '32': {
    id: 32,
    text: 'I will win at least 5x pink',
    subtext: '',
    difficulty: [2, 3, 3],
    test: task_winCardCountWithProperty(5, Suit.PINK, false),
  },
  '33': {
    id: 33,
    text: 'I will win at least 7x yellow',
    subtext: '',
    difficulty: [3, 3, 3],
    test: task_winCardCountWithProperty(7, Suit.YELLOW, false),
  },
  '34': {
    id: 34,
    text: 'I will win exactly 1 trick',
    subtext: '',
    difficulty: [3, 2, 2],
    test: task_winExactTrickCount(1),
  },
  '35': {
    id: 35,
    text: 'I will win exactly 2 tricks',
    subtext: '',
    difficulty: [2, 2, 2],
    test: task_winExactTrickCount(2),
  },
  '36': {
    id: 36,
    text: 'I will win exactly 4 tricks',
    subtext: '',
    difficulty: [2, 3, 5],
    test: task_winExactTrickCount(4),
  },
  '37': {
    id: 37,
    text: 'I will win exactly 2 tricks and they will be in a row',
    subtext: '',
    difficulty: [3, 3, 3],
    test: taskIntersection(task_winExactTrickCount(2), task_winConsecutiveTricks(2)),
  },
  '38': {
    id: 38,
    text: 'I will win exactly 3 tricks and they will be in a row',
    subtext: '',
    difficulty: [3, 3, 4],
    test: taskIntersection(task_winExactTrickCount(3), task_winConsecutiveTricks(3)),
  },
  '39': {
    id: 39,
    text: 'I will win exactly 1x pink',
    subtext: '',
    difficulty: [3, 3, 4],
    test: task_winCardCountWithProperty(1, Suit.PINK, true),
  },
  '40': {
    id: 40,
    text: 'I will win exactly 1x pink and 1x green',
    subtext: '',
    difficulty: [4, 4, 4],
    test: taskIntersection(
      task_winCardCountWithProperty(1, Suit.PINK, true),
      task_winCardCountWithProperty(1, Suit.GREEN, true),
    ),
  },
  '41': {
    id: 41,
    text: 'I will win exactly 2x blue',
    subtext: '',
    difficulty: [3, 4, 4],
    test: task_winCardCountWithProperty(2, Suit.BLUE, true),
  },
  '42': {
    id: 42,
    text: 'I will win exactly 2x green',
    subtext: '',
    difficulty: [3, 4, 4],
    test: task_winCardCountWithProperty(2, Suit.GREEN, true),
  },
  '43': {
    id: 43,
    text: 'I will win exactly 1x black',
    subtext: 'If submarine cards 1,2,3,4 are in one hand, re-deal the playing cards',
    difficulty: [3, 3, 3],
    test: task_winCardCountWithProperty(1, Suit.BLACK, true),
  },
  '44': {
    id: 44,
    text: 'I will win exactly 2x black',
    subtext: 'If submarine cards 2,3,4 are in one hand, re-deal the playing cards',
    difficulty: [3, 3, 4],
    test: task_winCardCountWithProperty(2, Suit.BLACK, true),
  },
  '45': {
    id: 45,
    text: 'I will win exactly 3x black',
    subtext: 'If submarine cards 1,2,3,4 are in one hand, re-deal the playing cards',
    difficulty: [3, 4, 4],
    test: task_winCardCountWithProperty(3, Suit.BLACK, true),
  },
  '46': {
    id: 46,
    text: 'I will win exactly 2x 9s',
    subtext: '',
    difficulty: [2, 3, 3],
    test: task_winCardCountWithProperty(2, 9, true),
  },
  '47': {
    id: 47,
    text: 'I will win exactly 3x 6s',
    subtext: '',
    difficulty: [3, 4, 4],
    test: task_winCardCountWithProperty(3, 6, true),
  },
  '48': {
    id: 48,
    text: 'I will win fewer tricks than everyone else',
    subtext: '',
    difficulty: [2, 2, 3],
    test: (state, owner) => {
      const tasks = state.players
        .filter(p => p.id !== owner)
        .map(p => task_winComparativeTrickCount(Comparison.FEWER_THAN, p.id));
      return taskIntersection(...tasks)(state, owner);
    },
  },
  '49': {
    id: 49,
    text: 'I will win more tricks than anyone else',
    subtext: '',
    difficulty: [2, 3, 3],
    test: (state, owner) => {
      const tasks = state.players
        .filter(p => p.id !== owner)
        .map(p => task_winComparativeTrickCount(Comparison.MORE_THAN, p.id));
      return taskIntersection(...tasks)(state, owner);
    },
  },
  '50': {
    id: 50,
    text: 'I will win more tricks than everyone else combined',
    subtext: '',
    difficulty: [3, 4, 5],
    test: (state, owner) => {
      const numTricksToWin = Math.floor(getMaxTrickCount(state) / 2 + 1);
      const numTricksWon = getNumTricksWonByPlayer(owner, state);
      const numTricksRemainingToWin = numTricksToWin - numTricksWon;
      const numTricksRemaining = getRemainingTrickCount(state);
      if (numTricksRemaining < numTricksRemainingToWin) return TaskState.FAILURE;
      if (numTricksWon >= numTricksToWin) return TaskState.SUCCESS;
      return TaskState.PENDING;
    },
  },
  '51': {
    id: 51,
    text: 'I will win as many tricks as the Captain',
    subtext: 'I am not the Captain',
    difficulty: [4, 3, 3],
    test: task_winComparativeTrickCount(Comparison.EQUAL_TO, CAPTAIN),
  },
  '52': {
    id: 52,
    text: 'I will win fewer tricks than the Captain',
    subtext: 'I am not the Captain',
    difficulty: [2, 2, 2],
    test: task_winComparativeTrickCount(Comparison.FEWER_THAN, CAPTAIN),
  },
  '53': {
    id: 53,
    text: 'I will win more tricks than the Captain',
    subtext: 'I am not the Captain',
    difficulty: [2, 2, 3],
    test: task_winComparativeTrickCount(Comparison.MORE_THAN, CAPTAIN),
  },
  '54': {
    id: 54,
    text: 'I will win no 1s',
    subtext: '',
    difficulty: [2, 2, 2],
    test: task_winCardCountWithProperty(0, 1, true),
  },
  '55': {
    id: 55,
    text: 'I will win no 1s, no 2s, and no 3s',
    subtext: '',
    difficulty: [3, 3, 3],
    test: taskIntersection(
      task_winCardCountWithProperty(0, 1, true),
      task_winCardCountWithProperty(0, 2, true),
      task_winCardCountWithProperty(0, 3, true),
    ),
  },
  '56': {
    id: 56,
    text: 'I will win no 5s',
    subtext: '',
    difficulty: [1, 2, 2],
    test: task_winCardCountWithProperty(0, 5, true),
  },
  '57': {
    id: 57,
    text: 'I will win no 8s and no 9s',
    subtext: '',
    difficulty: [3, 3, 2],
    test: taskIntersection(task_winCardCountWithProperty(0, 8, true), task_winCardCountWithProperty(0, 9, true)),
  },
  '58': {
    id: 58,
    text: 'I will win no 9s',
    subtext: '',
    difficulty: [1, 1, 1],
    test: task_winCardCountWithProperty(0, 9, true),
  },
  '59': {
    id: 59,
    text: 'I will win no black',
    subtext: '',
    difficulty: [1, 1, 1],
    test: task_winCardCountWithProperty(0, Suit.BLACK, true),
  },
  '60': {
    id: 60,
    text: 'I will win no green',
    subtext: '',
    difficulty: [2, 2, 2],
    test: task_winCardCountWithProperty(0, Suit.GREEN, true),
  },
  '61': {
    id: 61,
    text: 'I will win no pink',
    subtext: '',
    difficulty: [2, 2, 2],
    test: task_winCardCountWithProperty(0, Suit.PINK, true),
  },
  '62': {
    id: 62,
    text: 'I will win no yellow',
    subtext: '',
    difficulty: [2, 2, 2],
    test: task_winCardCountWithProperty(0, Suit.YELLOW, true),
  },
  '63': {
    id: 63,
    text: 'I will win no pink and no blue',
    subtext: '',
    difficulty: [3, 3, 3],
    test: taskIntersection(
      task_winCardCountWithProperty(0, Suit.PINK, true),
      task_winCardCountWithProperty(0, Suit.BLUE, true),
    ),
  },
  '64': {
    id: 64,
    text: 'I will win no yellow and no green',
    subtext: '',
    difficulty: [3, 3, 3],
    test: taskIntersection(
      task_winCardCountWithProperty(0, Suit.YELLOW, true),
      task_winCardCountWithProperty(0, Suit.GREEN, true),
    ),
  },
  '65': {
    id: 65,
    text: 'I will win none of the first 3 tricks',
    subtext: '',
    difficulty: [1, 2, 2],
    test: taskIntersection(
      task_winNthTrick(1, undefined, true),
      task_winNthTrick(2, undefined, true),
      task_winNthTrick(3, undefined, true),
    ),
  },
  '66': {
    id: 66,
    text: 'I will win none of the first 4 tricks',
    subtext: '',
    difficulty: [1, 2, 3],
    test: taskIntersection(
      task_winNthTrick(1, undefined, true),
      task_winNthTrick(2, undefined, true),
      task_winNthTrick(3, undefined, true),
      task_winNthTrick(4, undefined, true),
    ),
  },
  '67': {
    id: 67,
    text: 'I will win none of the first 5 tricks',
    subtext: '',
    difficulty: [2, 3, 3],
    test: taskIntersection(
      task_winNthTrick(1, undefined, true),
      task_winNthTrick(2, undefined, true),
      task_winNthTrick(3, undefined, true),
      task_winNthTrick(4, undefined, true),
      task_winNthTrick(5, undefined, true),
    ),
  },
  '68': {
    id: 68,
    text: 'I will win only the first trick',
    subtext: '',
    difficulty: [4, 3, 3],
    test: taskIntersection(task_winNthTrick(1), task_winExactTrickCount(1)),
  },
  '69': {
    id: 69,
    text: 'I will win only the last trick',
    subtext: '',
    difficulty: [4, 4, 4],
    test: (state, owner) => {
      if (getNumTricksWonByPlayer(owner, state) > 1) return TaskState.FAILURE;
      const trick = getMostRecentTrick(state);
      if (state.tricks?.length === getMaxTrickCount(state)) {
        return trick?.winner === owner ? TaskState.SUCCESS : TaskState.FAILURE;
      }
      return trick?.winner === owner ? TaskState.FAILURE : TaskState.PENDING;
    },
  },
  '70': {
    id: 70,
    text: 'I will win the first trick',
    subtext: '',
    difficulty: [1, 1, 1],
    test: task_winNthTrick(1),
  },
  '71': {
    id: 71,
    text: 'I will win the first 2 tricks',
    subtext: '',
    difficulty: [1, 1, 2],
    test: taskIntersection(task_winNthTrick(1), task_winNthTrick(2)),
  },
  '72': {
    id: 72,
    text: 'I will win the first 3 tricks',
    subtext: '',
    difficulty: [2, 3, 4],
    test: taskIntersection(task_winNthTrick(1), task_winNthTrick(2), task_winNthTrick(3)),
  },
  '73': {
    id: 73,
    text: 'I will win the first and the last trick',
    subtext: '',
    difficulty: [3, 4, 4],
    test: taskIntersection(task_winNthTrick(1), task_winNthTrick(LAST_TRICK)),
  },
  '74': {
    id: 74,
    text: 'I will win the last trick',
    subtext: '',
    difficulty: [2, 3, 3],
    test: task_winNthTrick(LAST_TRICK),
  },
  '75': {
    id: 75,
    text: 'I will win the black 1 and no other submarine',
    subtext: 'If submarine cards 1 and 4 or 1,2,3 are in one hand, redeal the playing cards',
    difficulty: [3, 3, 3],
    test: taskIntersection(
      task_winSpecificCard({ number: 1, suit: Suit.BLACK }),
      task_winCardCountWithProperty(1, Suit.BLACK, true),
    ),
  },
  '76': {
    id: 76,
    text: 'I will win the black 2 and no other submarines',
    subtext: 'If submarine cards 2 and 4 or 1,2,3 are in one hand, re-deal the playing cards',
    difficulty: [3, 3, 3],
    test: taskIntersection(
      task_winSpecificCard({ number: 2, suit: Suit.BLACK }),
      task_winCardCountWithProperty(1, Suit.BLACK, true),
    ),
  },
  '77': {
    id: 77,
    text: 'I will win the black 3',
    subtext: '',
    difficulty: [1, 1, 1],
    test: task_winSpecificCard({ number: 3, suit: Suit.BLACK }),
  },
  '78': {
    id: 78,
    text: 'I will win the blue 1, blue 2, and blue 3',
    subtext: '',
    difficulty: [2, 3, 3],
    test: taskIntersection(
      task_winSpecificCard({ number: 1, suit: Suit.BLUE }),
      task_winSpecificCard({ number: 2, suit: Suit.BLUE }),
      task_winSpecificCard({ number: 3, suit: Suit.BLUE }),
    ),
  },
  '79': {
    id: 79,
    text: 'I will win the blue 4',
    subtext: '',
    difficulty: [1, 1, 1],
    test: task_winSpecificCard({ number: 4, suit: Suit.BLUE }),
  },
  '80': {
    id: 80,
    text: 'I will win the blue 6 and the yellow 7',
    subtext: '',
    difficulty: [2, 2, 3],
    test: taskIntersection(
      task_winSpecificCard({ number: 6, suit: Suit.BLUE }),
      task_winSpecificCard({ number: 7, suit: Suit.YELLOW }),
    ),
  },
  '81': {
    id: 81,
    text: 'I will win the green 3, yellow 4, and yellow 5',
    subtext: '',
    difficulty: [3, 4, 4],
    test: taskIntersection(
      task_winSpecificCard({ number: 3, suit: Suit.GREEN }),
      task_winSpecificCard({ number: 4, suit: Suit.YELLOW }),
      task_winSpecificCard({ number: 5, suit: Suit.YELLOW }),
    ),
  },
  '82': {
    id: 82,
    text: 'I will win the green 5 and the blue 8',
    subtext: '',
    difficulty: [2, 2, 3],
    test: taskIntersection(
      task_winSpecificCard({ number: 5, suit: Suit.GREEN }),
      task_winSpecificCard({ number: 8, suit: Suit.BLUE }),
    ),
  },
  '83': {
    id: 83,
    text: 'I will win the green 6',
    subtext: '',
    difficulty: [1, 1, 1],
    test: task_winSpecificCard({ number: 6, suit: Suit.GREEN }),
  },
  '84': {
    id: 84,
    text: 'I will win the pink 1 and the green 7',
    subtext: '',
    difficulty: [2, 2, 2],
    test: taskIntersection(
      task_winSpecificCard({ number: 1, suit: Suit.PINK }),
      task_winSpecificCard({ number: 7, suit: Suit.GREEN }),
    ),
  },
  '85': {
    id: 85,
    text: 'I will win the pink 3',
    subtext: '',
    difficulty: [1, 1, 1],
    test: task_winSpecificCard({ number: 3, suit: Suit.PINK }),
  },
  '86': {
    id: 86,
    text: 'I will win the pink 5 and the yellow 6',
    subtext: '',
    difficulty: [2, 2, 3],
    test: taskIntersection(
      task_winSpecificCard({ number: 5, suit: Suit.PINK }),
      task_winSpecificCard({ number: 6, suit: Suit.YELLOW }),
    ),
  },
  '87': {
    id: 87,
    text: 'I will win the pink 8 and the blue 5',
    subtext: '',
    difficulty: [2, 2, 3],
    test: taskIntersection(
      task_winSpecificCard({ number: 8, suit: Suit.PINK }),
      task_winSpecificCard({ number: 5, suit: Suit.BLUE }),
    ),
  },
  '88': {
    id: 88,
    text: 'I will win the pink 9 and the yellow 8',
    subtext: '',
    difficulty: [2, 3, 3],
    test: taskIntersection(
      task_winSpecificCard({ number: 9, suit: Suit.PINK }),
      task_winSpecificCard({ number: 8, suit: Suit.YELLOW }),
    ),
  },
  '89': {
    id: 89,
    text: 'I will win the yellow 1',
    subtext: '',
    difficulty: [1, 1, 1],
    test: task_winSpecificCard({ number: 1, suit: Suit.YELLOW }),
  },
  '90': {
    id: 90,
    text: 'I will win the yellow 9 and the blue 7',
    subtext: '',
    difficulty: [2, 3, 3],
    test: taskIntersection(
      task_winSpecificCard({ number: 9, suit: Suit.YELLOW }),
      task_winSpecificCard({ number: 7, suit: Suit.BLUE }),
    ),
  },
  '91': {
    id: 91,
    text: 'I will win the pink 7 with a black',
    subtext: '',
    difficulty: [3, 3, 3],
    test: task_winTrickUsingCard(Suit.BLACK, trickContains({ suit: Suit.PINK, number: 7 })),
  },
  '92': {
    id: 92,
    text: 'I will win the green 9 with a black',
    subtext: '',
    difficulty: [3, 3, 3],
    test: task_winTrickUsingCard(Suit.BLACK, trickContains({ suit: Suit.GREEN, number: 9 })),
  },
  '93': {
    id: 93,
    text: 'I will win the green 2 in the final trick of the game',
    subtext: '',
    difficulty: [3, 4, 5],
    test: task_winNthTrick(LAST_TRICK, trickContains({ suit: Suit.GREEN, number: 2 })),
  },
  '94': {
    id: 94,
    text: 'I will win X tricks',
    subtext: 'Note your prediction but keep it secret',
    difficulty: [4, 3, 3],
    requiresExtraData: true,
    test: (state, owner) => {
      const { n } = getTaskDataForPlayer(state, owner, 94);
      if (n === undefined || typeof n !== 'number') throw new Error('Missing required extra data for task');
      return task_winExactTrickCount(n)(state, owner);
    },
  },
  '95': {
    id: 95,
    text: 'I will win X tricks',
    subtext: 'Note your prediction and share it with the crew',
    difficulty: [3, 2, 2],
    requiresExtraData: true,
    test: (state, owner) => {
      const { n } = getTaskDataForPlayer(state, owner, 95);
      if (n === undefined || typeof n !== 'number') throw new Error('Missing required extra data for task');
      return task_winExactTrickCount(n)(state, owner);
    },
  },
} as TasksData;
