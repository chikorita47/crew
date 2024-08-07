import { getCaptainId, getNextPlayerId } from '../selectors';
import {
  Card,
  // CardTally,
  Comparison,
  GameState,
  MaxNumCards,
  Suit,
  TaskState,
  TasksDataEntryTest,
  Trick,
} from '../types';
import { isCardEqual, isCardSimilar } from '../utilities';

export const LAST_TRICK = 'LAST_TRICK';
export const CAPTAIN = 'CAPTAIN';

// I will win the {card}
export function task_winSpecificCard(card: Card): TasksDataEntryTest {
  return (state: GameState, owner: number): TaskState => {
    const trickWithCard = state.tricks?.find(trick => trick.cards?.some(trickCard => isCardEqual(card, trickCard)));
    if (trickWithCard) {
      return trickWithCard.winner === owner ? TaskState.SUCCESS : TaskState.FAILURE;
    }
    return TaskState.PENDING;
  };
}

//  I will win exactly {count} tricks
export function task_winExactTrickCount(count: number): TasksDataEntryTest {
  return (state: GameState, owner: number): TaskState => {
    const numTricksWonByOwner = getNumTricksWonByPlayer(owner, state);
    if (numTricksWonByOwner > count) return TaskState.FAILURE;
    if (numTricksWonByOwner + getRemainingTrickCount(state) < count) return TaskState.FAILURE;
    if (!getIsGameOver(state)) return TaskState.PENDING;
    if (numTricksWonByOwner === count) return TaskState.SUCCESS;
    return TaskState.PENDING;
  };
}

// I will win {more/fewer/as many} tricks than/as {player}
export function task_winComparativeTrickCount(
  comparison: Comparison,
  player: number | typeof CAPTAIN,
): TasksDataEntryTest {
  return (state: GameState, owner: number): TaskState => {
    if (!getIsGameOver(state)) return TaskState.PENDING;

    const numTricksWonByOwner = getNumTricksWonByPlayer(owner, state);
    const numTricksWonByTarget = getNumTricksWonByPlayer(player === CAPTAIN ? getCaptainId(state) : player, state);

    const comparisonMet = compare(numTricksWonByOwner, comparison, numTricksWonByTarget);

    if (comparisonMet) return TaskState.SUCCESS;
    return TaskState.FAILURE;
  };
}

// I will win {count} tricks in a row
export function task_winConsecutiveTricks(count: number): TasksDataEntryTest {
  return (state: GameState, owner: number): TaskState => {
    const consecutiveTricks = getNumConsecutiveTricksWonByPlayer(owner, state);
    const remainingTricks = getRemainingTrickCount(state);
    if (consecutiveTricks >= count) return TaskState.SUCCESS;
    if (consecutiveTricks + remainingTricks < count) return TaskState.FAILURE;
    return TaskState.PENDING;
  };
}

// I will win at least 2x 7s     (2, 7, false)
// I will win exactly 7x pink    (7, Suit.PINK, true)
// I will win no pink            (0, Suit.PINK, true)
export function task_winCardCountWithProperty(
  count: number,
  property: Suit | number,
  exact: boolean,
): TasksDataEntryTest {
  return (state: GameState, owner: number): TaskState => {
    const ownerCards = getCardsWonByPlayer(owner, state);
    const cardsWon = getCardsWithProperty(ownerCards, property);
    const isGameOver = getIsGameOver(state);
    // TODO: add logic if cards needed have been won by other players?

    if (exact && cardsWon.length > count) return TaskState.FAILURE;
    if (exact && !isGameOver) return TaskState.PENDING;
    if (exact && cardsWon.length === count) return TaskState.SUCCESS;
    if (cardsWon.length >= count) return TaskState.SUCCESS;
    if (isGameOver) return TaskState.FAILURE;
    return TaskState.PENDING;
  };
}

// I will win as many pink as yellow
// I will win more pink than green
export function task_winComparativeCardCountForProperties(
  propertyA: Suit | number,
  comparison: Comparison,
  propertyB: Suit | number,
): TasksDataEntryTest {
  return (state: GameState, owner: number): TaskState => {
    if (!getIsGameOver(state)) return TaskState.PENDING;
    const ownerCards = getCardsWonByPlayer(owner, state);
    const countA = getCardsWithProperty(ownerCards, propertyA).length;
    const countB = getCardsWithProperty(ownerCards, propertyB).length;

    const comparisonMet = compare(countA, comparison, countB);
    if (comparisonMet) return TaskState.SUCCESS;
    return TaskState.FAILURE;
  };
}

// I will win a trick with a total value {greater than / less than / of} {value}
export function task_winTrickWithValueComparison(value: number, comparison: Comparison): TasksDataEntryTest {
  return (state: GameState, owner: number): TaskState => {
    const trick = getMostRecentTrick(state);
    if (trick?.winner !== owner) return TaskState.PENDING;

    const trickValue = trick?.cards?.reduce((acc, trick) => acc + trick.number, 0) || 0;
    const comparisonMet = compare(trickValue, comparison, value);
    if (comparisonMet) return TaskState.SUCCESS;
    return TaskState.PENDING;
  };
}

/**
 * Generic task helper. Use for tasks where each card in a trick must meet the same criteria.
 * @param test A function that is run for each `Card` in the most recent trick
 * @example // I will win a trick that contains only even-numbered cards
 * task_winTrickPassingCardTest((c) => c.number % 2 === 0)
 */
export function task_winTrickPassingCardTest(test: (card: Card) => boolean): TasksDataEntryTest {
  return (state: GameState, owner: number): TaskState => {
    const trick = getMostRecentTrick(state);
    if (trick?.winner !== owner) return TaskState.PENDING;
    if (trick.cards?.every(c => test(c))) return TaskState.SUCCESS;
    return TaskState.PENDING;
  };
}

/** 
   * Generic task helper. Use for tasks where cards in a trick are tested against other cards in the trick.
   * @param test A function that is run once for the whole array of Cards in a trick
   * @example // I will win as many pink as green cards in one trick.
     task_winTrickPassingAggregateTest((cards) => {
        const pink = cards.filter((c) => c.suit === Suit.PINK).length;
        const green = cards.filter((c) => c.suit === Suit.GREEN).length;
        return pink === green && pink !== 0;
     })
   * 
  */
export function task_winTrickPassingAggregateTest(test: (cards: Card[]) => boolean): TasksDataEntryTest {
  return (state: GameState, owner: number): TaskState => {
    const trick = getMostRecentTrick(state);
    if (trick?.winner !== owner || !trick.cards) return TaskState.PENDING;
    if (test(trick.cards)) return TaskState.SUCCESS;
    return TaskState.PENDING;
  };
}

// I will win the {ordinal} trick
// I will win the green 2 in the last trick of the game
// I will NOT win the {ordinal} trick
export function task_winNthTrick(
  n: number | typeof LAST_TRICK,
  condition: (trick: Trick) => boolean = () => true,
  not = false,
): TasksDataEntryTest {
  return (state: GameState, owner: number): TaskState => {
    const realN = n === LAST_TRICK ? getMaxTrickCount(state) : n;
    if (!state.tricks || !state.tricks.length) return TaskState.PENDING;
    if (realN > state.tricks.length) return TaskState.PENDING;
    if (not ? state.tricks[realN - 1].winner !== owner : state.tricks[realN - 1].winner === owner) {
      return condition(state.tricks[realN - 1]) ? TaskState.SUCCESS : TaskState.FAILURE;
    }
    return TaskState.FAILURE;
  };
}

// these tasks must be evaluated after every card play, instead of after every trick
// some tasks like this one should be marked as WON if still pending at the end of the game?
export function task_notOpenTrickWithCardProperty(property: Suit | number): TasksDataEntryTest {
  return (state: GameState, owner: number): TaskState => {
    const trick = getMostRecentTrick(state);
    const isLastTrick = state.tricks?.length === getMaxTrickCount(state);
    if (!trick) return TaskState.PENDING;

    if (owner === getNextPlayerId(state) && !isLastTrick) {
      // owner must lead, and hand only contains cards with the given property
      if (state.players[owner].hand?.every(card => card.number === property || card.suit === property))
        return TaskState.FAILURE;
    }

    if (owner !== trick.leader) {
      if (isLastTrick) {
        return TaskState.SUCCESS;
      }
      return TaskState.PENDING;
    }

    // owner leads with a card with given property
    if (trick.cards?.[0].number === property || trick.cards?.[0].suit === property) return TaskState.FAILURE;

    if (isLastTrick && (trick.cards?.length || 0) > 1) {
      return TaskState.SUCCESS;
    }

    return TaskState.PENDING;
  };
}

// I will win a trick using a {number}
// I will win a {number} with a {number}
export function task_winTrickUsingCard(
  cardOrProperty: Card | Suit | number,
  condition: (trick: Trick) => boolean = () => true,
): TasksDataEntryTest {
  return (state: GameState, owner: number): TaskState => {
    const trick = getMostRecentTrick(state);
    if (trick?.winner !== owner) return TaskState.PENDING;
    if (!condition(trick)) return TaskState.PENDING;

    const ownerCard = getCardPlayedByPlayerInTrick(owner, trick, state);
    const card: Partial<Card> =
      typeof cardOrProperty !== 'number' && typeof cardOrProperty !== 'string'
        ? { number: cardOrProperty.number, suit: cardOrProperty.suit }
        : makeCard(cardOrProperty);

    if (isCardSimilar(ownerCard, card)) return TaskState.SUCCESS;
    return TaskState.PENDING;
  };
}

// Selectors
// export function getCaptain(state: GameState) {
//   return state.players.find((p) => p.isCaptain)!;
// }
export function getMostRecentTrick(state: GameState) {
  return state.tricks?.[state.tricks.length - 1];
}
export function getCardsWonByPlayer(player: number, state: GameState) {
  const tricksWon = state.tricks?.filter(t => t.winner === player) || [];
  return tricksWon.flatMap(t => t.cards || []);
}
export function getIsGameOver(state: GameState) {
  const maxTricks = getMaxTrickCount(state);
  return state.tricks?.length === maxTricks; // && getMostRecentTrick(state)?.cards.length === state.players.length
}
export function getMaxTrickCount(state: GameState) {
  return Math.floor(40 / state.players.length);
}
export function getRemainingTrickCount(state: GameState) {
  const tricks = state.tricks?.length || 0;
  return getMaxTrickCount(state) - tricks;
}
// export function getRemainingCards(state: GameState) {
//   return state.remainingCards as CardTally;
// }
// export function getRemainingCardsWithProperty(
//   property: Suit | number,
//   state: GameState,
// ) {
//   const remainingCards = getRemainingCards(state);
//   if (typeof property === 'number')
//     return Object.entries(remainingCards)
//       .filter(([k, v]) => v.filter(n => n === property))
//       .map(([k, v]) => ({suit: k, number: property}));
//   if (property === Suit.BLACK)
//     return remainingCards.black.map(number => ({suit: property, number}));
//   return remainingCards[property].map(number => ({suit: property, number}));
// }
export function getNumTricksWonByPlayer(player: number, state: GameState) {
  return state.tricks?.filter(t => t.winner === player).length || 0;
}
export function getNumConsecutiveTricksWonByPlayer(player: number, state: GameState) {
  return state.tricks?.reduce((acc, trick) => (trick.winner === player ? acc + 1 : 0), 0) || 0;
}
export function getCardsWithProperty(cards: Card[], property: Suit | number) {
  // if property is a number, black should never be a match
  return cards.filter(c => (c.number === property && c.suit !== Suit.BLACK) || c.suit === property);
}
export function getCardPlayedByPlayerInTrick(player: number, trick: Trick, state: GameState) {
  if (!trick.cards) throw new Error('No cards have been played in the given trick');
  const numPlayers = state.players.length;
  const index = (player - trick.leader + numPlayers) % numPlayers;
  return trick.cards[index];
}

// Task Util Functions
export function taskIntersection(...tests: TasksDataEntryTest[]): TasksDataEntryTest {
  return (state: GameState, owner: number): TaskState => {
    if (tests.every(t => t(state, owner) === TaskState.SUCCESS)) return TaskState.SUCCESS;
    if (tests.some(t => t(state, owner) === TaskState.FAILURE)) return TaskState.FAILURE;
    return TaskState.PENDING;
  };
}
export function taskUnion(...tests: TasksDataEntryTest[]): TasksDataEntryTest {
  return (state: GameState, owner: number): TaskState => {
    if (tests.some(t => t(state, owner) === TaskState.SUCCESS)) return TaskState.SUCCESS;
    if (tests.every(t => t(state, owner) === TaskState.FAILURE)) return TaskState.FAILURE;
    return TaskState.PENDING;
  };
}
export function compare(a: number, comparison: Comparison, b: number) {
  switch (comparison) {
    case Comparison.EQUAL_TO:
      return a === b;
    case Comparison.MORE_THAN:
      return a > b;
    case Comparison.FEWER_THAN:
      return a < b;
  }
}
export function trickContains(cardOrProperty: Partial<Card> | number | Suit, quantity: MaxNumCards = 1, exact = false) {
  return (trick: Trick) => {
    const card = makeCard(cardOrProperty);
    const matchingCards = trick.cards?.filter(trickCard => isCardSimilar(trickCard, card)) || [];
    return exact ? matchingCards.length === quantity : matchingCards.length >= quantity;
  };
}
export function makeCard(from: Suit | number | Partial<Card>): Partial<Card> {
  if (typeof from === 'number' || typeof from === 'string') {
    return typeof from === 'number' ? { number: from } : { suit: from };
  } else return from;
}
