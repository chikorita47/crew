import {
  Card,
  CardTally,
  Comparison,
  GameState,
  Suit,
  TaskState,
  Trick,
} from '@/types';

// I will win the {card}
export function task_winSpecificCard(
  card: Card,
  state: GameState,
  owner: number,
): TaskState {
  const trick = getMostRecentTrick(state);
  if (trick?.winner !== owner) return TaskState.PENDING;
  if (trick?.cards?.includes(card)) return TaskState.SUCCESS;
  return TaskState.PENDING;
}

//  I will win exactly {count} tricks
export function task_winExactTrickCount(
  count: number,
  state: GameState,
  owner: number,
): TaskState {
  const numTricksWonByOwner = getNumTricksWonByPlayer(owner, state);
  if (numTricksWonByOwner > count) return TaskState.FAILURE;
  if (!getIsGameOver(state)) return TaskState.PENDING;
  if (numTricksWonByOwner === count) return TaskState.SUCCESS;
  return TaskState.PENDING;
}

// I will win {more/fewer/as many} tricks than/as {player}
export function task_winComparativeTrickCount(
  comparison: Comparison,
  player: number,
  state: GameState,
  owner: number,
) {
  const numTricksWonByOwner = getNumTricksWonByPlayer(owner, state);
  const numTricksWonByTarget = getNumTricksWonByPlayer(player, state);

  const comparisonMet = compare(
    numTricksWonByOwner,
    comparison,
    numTricksWonByTarget,
  );

  if (comparisonMet) return TaskState.SUCCESS;
  return TaskState.PENDING;
}

// I will win {count} tricks in a row
export function task_winConsecutiveTricks(
  count: number,
  state: GameState,
  owner: number,
): TaskState {
  const consecutiveTricks = getNumConsecutiveTricksWonByPlayer(owner, state);
  const remainingTricks = getRemainingTrickCount(state);
  if (consecutiveTricks >= count) return TaskState.SUCCESS;
  if (consecutiveTricks + remainingTricks < count) return TaskState.FAILURE;
  return TaskState.PENDING;
}

// I will win at least 2x 7s     (2, 7, false)
// I will win exactly 7x pink    (7, 'pink', true)
// I will win no pink            (0, 'pink', true)
export function task_winCardCountWithProperty(
  count: number,
  property: Suit | number,
  exact: boolean,
  state: GameState,
  owner: number,
): TaskState {
  const cardsWon = getCardsWonByPlayer(owner, state).filter(
    c => c.number === property || c.suit === property,
  );
  // TODO: add logic if cards needed have been won by other players?

  if (exact && cardsWon.length > count) return TaskState.FAILURE;
  if (exact && !getIsGameOver(state)) return TaskState.PENDING;
  if (cardsWon.length >= count) return TaskState.SUCCESS;
  return TaskState.PENDING;
}

// I will win a trick with a total value {greater than / less than / of} {value}
export function task_winTrickWithValueComparison(
  value: number,
  comparison: Comparison,
  state: GameState,
  owner: number,
): TaskState {
  const trick = getMostRecentTrick(state);
  if (trick?.winner !== owner) return TaskState.PENDING;

  const trickValue =
    trick?.cards?.reduce((acc, trick) => acc + trick.number, 0) || 0;
  const comparisonMet = compare(trickValue, comparison, value);
  if (comparisonMet) return TaskState.SUCCESS;
  return TaskState.PENDING;
}

/**
 * Generic task helper. Use for tasks where each card in a trick must meet the same criteria.
 * @param test A function that is run for each `Card` in the most recent trick
 * @example // I will win a trick that contains only even-numbered cards
 * task_winTrickWithCardTest((c) => c.number % 2 === 0, state, owner)
 */
export function task_winTrickPassingCardTest(
  test: (card: Card) => boolean,
  state: GameState,
  owner: number,
): TaskState {
  const trick = getMostRecentTrick(state);
  if (trick?.winner !== owner) return TaskState.PENDING;
  if (trick.cards?.every(c => test(c))) return TaskState.SUCCESS;
  return TaskState.PENDING;
}

/** 
   * Generic task helper. Use for tasks where cards in a trick are tested against other cards in the trick.
   * @param test A function that is run once for the whole array of Cards in a trick
   * @example // I will win as many pink as green cards in one trick.
     task_winTrickWithAggregateTest((cards) => {
        const pink = cards.filter((c) => c.suit === 'pink');
        const green = cards.filter((c) => c.suit === 'green');
        return pink === green;
     }, state, owner)
   * 
  */
export function task_winTrickPassingAggregateTest(
  test: (cards: Card[]) => boolean,
  state: GameState,
  owner: number,
): TaskState {
  const trick = getMostRecentTrick(state);
  if (trick?.winner !== owner || !trick.cards) return TaskState.PENDING;
  if (test(trick.cards)) return TaskState.SUCCESS;
  return TaskState.PENDING;
}

// I will win the {ordinal} trick
// I will win the green 2 in the last trick of the game
export function task_winNthTrick(
  n: number,
  state: GameState,
  owner: number,
  condition: (trick: Trick) => boolean = () => true,
): TaskState {
  if (n !== state.tricks?.length) return TaskState.PENDING;
  if (state.tricks[n].winner === owner) {
    return condition(state.tricks[n]) ? TaskState.SUCCESS : TaskState.FAILURE;
  }
  return TaskState.FAILURE;
}

// these tasks must be evaluated after every card play, instead of after every trick
// some tasks like this one should be marked as WON if still pending at the end of the game?
export function task_notOpenTrickWithCardProperty(
  property: Suit | number,
  state: GameState,
  owner: number,
) {
  const trick = state.tricks?.[state.tricks.length];
  if (!trick) return TaskState.PENDING;
  if (owner !== trick.leader || (trick.cards?.length || 0) > 1)
    return TaskState.PENDING;

  // owner leads with a card with given property
  if (
    trick.cards?.length === 1 &&
    (trick.cards[0].number === property || trick.cards[0].suit === property)
  )
    return TaskState.FAILURE;

  // owner's hand only contains cards with the given property
  if (
    state.players[0].hand?.every(
      card => card.number === property || card.suit === property,
    )
  )
    return TaskState.FAILURE;
  if (state.tricks?.length === getMaxTrickCount(state))
    return TaskState.SUCCESS;
  return TaskState.PENDING;
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
//   if (property === 'black')
//     return remainingCards.black.map(number => ({suit: property, number}));
//   return remainingCards[property].map(number => ({suit: property, number}));
// }
export function getNumTricksWonByPlayer(player: number, state: GameState) {
  return state.tricks?.filter(t => t.winner === player).length || 0;
}
export function getNumConsecutiveTricksWonByPlayer(
  player: number,
  state: GameState,
) {
  return (
    state.tricks?.reduce(
      (acc, trick) => (trick.winner === player ? acc + 1 : 0),
      0,
    ) || 0
  );
}

// Task Util Functions
export function taskIntersection(...tasks: TaskState[]) {
  if (tasks.every(t => t === TaskState.SUCCESS)) return TaskState.SUCCESS;
  if (tasks.some(t => t === TaskState.FAILURE)) return TaskState.FAILURE;
  return TaskState.PENDING;
}
export function taskUnion(...tasks: TaskState[]) {
  if (tasks.some(t => t === TaskState.SUCCESS)) return TaskState.SUCCESS;
  if (tasks.every(t => t === TaskState.FAILURE)) return TaskState.FAILURE;
  return TaskState.PENDING;
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
