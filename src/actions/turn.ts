import {
  getNextPlayerId,
  getPlayerName,
  getPlayerCard,
  getIsBetweenTricks,
  getCurrentTrick,
  getNumberOfPlayers,
  getCurrentTrickId,
  getPlayerHint,
  getIsCardLegalToPlay,
  getAreAllHintsUsed,
} from '../selectors';
import { HintPlacement, GameState } from '../types';

import { computeAndSetTaskState, computeWinner } from './utilities';

/**
 * Plays the card at `cardIndex` in the player's hand.
 *  - Removes the card from the player's hand.
 *  - Checks to see if the card matches the player's hint, and clears the hint if so.
 *  - Adds the card to an existing trick, or creates a new trick if needed.
 *  - Checks to see if the trick is now complete; if so, computes the winner of the trick
 *    and computes the state of all tasks.
 */
export function playCard(state: GameState, playerId: number, cardIndex: number): GameState {
  if (getNextPlayerId(state) !== playerId) {
    throw new Error(`${getPlayerName(state, playerId)} is trying to play out of turn`);
  }

  const newState = structuredClone(state);

  if (!getIsCardLegalToPlay(state, playerId, cardIndex)) {
    throw new Error('You must follow suit');
  }

  const card = getPlayerCard(state, playerId, cardIndex);
  // remove card from hand
  newState.players[playerId].hand!.splice(cardIndex, 1);
  // and from hint, if it's there
  const hint = newState.players[playerId].hint;
  if (hint && hint.card && hint.card.number === card.number && hint.card.suit == card.suit) {
    newState.players[playerId].hint = { used: true };
  }

  if (!newState.tricks) {
    newState.tricks = [];
  }
  const latestTrick = getCurrentTrick(state);
  const numberOfPlayers = getNumberOfPlayers(state);

  if (latestTrick.cards && latestTrick.cards.length === numberOfPlayers) {
    const newTrick = {
      leader: playerId,
      cards: [card],
    };
    newState.tricks!.push(newTrick);
  } else {
    const updatedTrick = {
      ...latestTrick,
      cards: [...(latestTrick.cards || []), card],
    };
    const isTrickComplete = updatedTrick.cards.length === numberOfPlayers;
    if (isTrickComplete) {
      updatedTrick.winner = computeWinner(updatedTrick, numberOfPlayers);
    }
    newState.tricks![getCurrentTrickId(state)] = updatedTrick;

    if (isTrickComplete) {
      computeAndSetTaskState(newState);
    }
  }

  return newState;
}

/**
 * Sets the player's hint to the card at `cardIndex` in their hand.
 */
export function giveHint(state: GameState, playerId: number, cardIndex: number, placement: HintPlacement): GameState {
  if (!getIsBetweenTricks(state)) {
    throw new Error('Cannot give a hint during a trick');
  }

  const playerHint = getPlayerHint(state, playerId);
  if (playerHint.used) {
    throw new Error('Cannot give multiple hints in one game');
  }

  if (getAreAllHintsUsed(state)) {
    throw new Error('All hints have been used');
  }

  const card = getPlayerCard(state, playerId, cardIndex);

  const newState = structuredClone(state);
  newState.players[playerId].hint = {
    used: true,
    card,
    placement,
  };

  return newState;
}
