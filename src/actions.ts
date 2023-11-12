import { ref, set, child } from 'firebase/database';
import db from './firebase';
import {
  getNextPlayerId,
  getPlayerName,
  getPlayerCard,
  getIsBetweenTricks,
  getLedSuitForCurrentTrick,
  getPlayerCardsOfSuit,
  getCurrentTrick,
  getNumberOfPlayers,
  getCurrentTrickId,
  getPlayerHint
} from './selectors';
import { Card, HintPlacement, GameState } from './types';

function updateState(newState: GameState) {
  const gameRef = child(child(ref(db), 'games'), 'AAAA');
  set(gameRef, newState);
}

export function playCard(state: GameState, playerId: number, cardIndex: number): void {
  if (getNextPlayerId(state) !== playerId) {
    throw new Error(`${getPlayerName(state, playerId)} is trying to play out of turn`);
  }

  const newState = structuredClone(state);

  const card = getPlayerCard(state, playerId, cardIndex);
  if (!getIsBetweenTricks(state)) {
    // check that card is legal to play
    const ledSuit = getLedSuitForCurrentTrick(state)!!;
    if (card.suit !== ledSuit && getPlayerCardsOfSuit(state, playerId, ledSuit).length) {
      throw new Error('You must follow suit');
    }
  }
  newState.players[playerId].hand!!.splice(cardIndex, 1);

  if (!newState.tricks) {
    newState.tricks = [];
  }
  const latestTrick = getCurrentTrick(state);
  const numberOfPlayers = getNumberOfPlayers(state)
  if (latestTrick.cards && latestTrick.cards.length === numberOfPlayers) {
    const newTrick = {
      leader: playerId,
      cards: [card],
    };
    newState.tricks!!.push(newTrick);
  } else {
    const updatedTrick = {
      ...latestTrick,
      cards: [...latestTrick.cards || [], card],
    };
    if (updatedTrick.cards.length === numberOfPlayers) {
      // compute the winner
      let highestBlackPos: number | null = null;
      let highestLedPos = 0;
      updatedTrick.cards.forEach((trickCard, index) => {
        if (trickCard.suit === 'black' && (highestBlackPos === null || updatedTrick.cards[highestBlackPos].number < trickCard.number)) {
          highestBlackPos = index;
        }
        if (highestBlackPos === null && trickCard.suit === updatedTrick.cards[0].suit && updatedTrick.cards[highestLedPos].number < trickCard.number) {
          highestLedPos = index;
        }
      });
      const winningPos = highestBlackPos !== null ? highestBlackPos : highestLedPos;
      updatedTrick.winner = (winningPos + updatedTrick.leader) % numberOfPlayers;
      // TODO: compute if any goals have been completed
    }
    newState.tricks!![getCurrentTrickId(state)] = updatedTrick;
  }

  updateState(newState);
}

export function getHintPlacement(state: GameState, playerId: number, cardIndex: number): HintPlacement {
  const hintCard = getPlayerCard(state, playerId, cardIndex);
  if (hintCard.suit === 'black') throw new Error('Cannot give a hint about a black card');
  const cardsOfHintSuit = getPlayerCardsOfSuit(state, playerId, hintCard.suit).map(card => card.number);
  const highestNumberOfHintSuit = Math.max(...cardsOfHintSuit);
  const lowestNumberOfHintSuit = Math.min(...cardsOfHintSuit);
  if (hintCard.number === highestNumberOfHintSuit && hintCard.number === lowestNumberOfHintSuit) {
    return 'middle';
  } else if (hintCard.number === highestNumberOfHintSuit) {
    return 'top';
  } else if (hintCard.number === lowestNumberOfHintSuit) {
    return 'bottom';
  }
  throw new Error('Cannot give a hint about this card');
}

export function giveHint(state: GameState, playerId: number, cardIndex: number): void {
  if (!getIsBetweenTricks(state)) {
    throw new Error('Cannot give a hint during a trick');
  }

  const playerHint = getPlayerHint(state, playerId);
  if (playerHint.used) {
    throw new Error('Cannot give multiple hints in one game');
  }

  const card = getPlayerCard(state, playerId, cardIndex);
  const placement = getHintPlacement(state, playerId, cardIndex);

  const newState = structuredClone(state);
  newState.players[playerId].hint = {
    used: true,
    card,
    placement,
  }

  updateState(newState);
}

export function deal(state: GameState, dealerId: number): void {
  // if (!getIsGameFinished(state)) {
  //   throw new Error('Game is in progress');
  // }

  const newState = structuredClone(state);

  const cards = [//@ts-ignore
    ...[...Array(9).keys()].map(i => ({ number: i + 1, suit: 'blue' })),//@ts-ignore
    ...[...Array(9).keys()].map(i => ({ number: i + 1, suit: 'green' })),//@ts-ignore
    ...[...Array(9).keys()].map(i => ({ number: i + 1, suit: 'yellow' })),//@ts-ignore
    ...[...Array(9).keys()].map(i => ({ number: i + 1, suit: 'pink' })),//@ts-ignore
    ...[...Array(4).keys()].map(i => ({ number: i + 1, suit: 'black' })),
  ] as Card[];
  const suitOrder = {
    'black': 0,
    'blue': 1,
    'green': 2,
    'yellow': 3,
    'pink': 4,
  }
  for (let i = cards.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[randomIndex]] = [cards[randomIndex], cards[i]];
  }
  const players = newState.players;
  for (const player of players) {
    player.hand = [];
    player.hint = { used: false };
    player.isCaptain = false;
    player.isDealer = player.id === dealerId;
  }
  const numberOfPlayers = players.length;
  for (let i = 0; i < cards.length; i++) {
    const player = (i + dealerId + 1) % numberOfPlayers;
    const card = cards[i];
    players[player].hand!!.push(card);
    if (card.number === 4 && card.suit === 'black') {
      players[player].isCaptain = true;
    }
  }
  const minHandSize = Math.min(...players.map(player => player.hand!!.length));
  for (const player of players) {
    player.extraCards = player.hand!!.length - minHandSize;
    player.hand = player.hand!!.sort((a, b) => {
      if (a.suit !== b.suit) {
        return suitOrder[a.suit] - suitOrder[b.suit];
      }
      return b.number - a.number;
    });
  }

  newState.tricks = [];

  updateState(newState);
}
