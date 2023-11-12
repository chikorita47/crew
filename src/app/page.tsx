'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image'
import styles from './page.module.css'

import db from '../firebase';
import { ref, set, get, child, onValue } from "firebase/database";


type Suit = 'blue' | 'green' | 'yellow' | 'pink' | 'black'
type Card = {
  number: number;
  suit: Suit;
};

type Trick = {
  cards?: Card[];
  winner?: number;
  leader: number;
};

type HintPlacement = 'top' | 'middle' | 'bottom'
type Hint = {
  used: boolean;
  card?: Card;
  placement?: HintPlacement;
};

type PlayerGoal = {
  id: number;
  done: boolean;
};

type UnassignedGoal = {
  id: number;
  proposedPlayerId: number;
};

type Player = {
  id: number;
  name: string;
  hand?: Card[];
  hint?: Hint;
  goals?: PlayerGoal[];
  isCaptain: boolean;
  isDealer: boolean;
  extraCards: number;
};

type GameState = {
  players: Player[];
  tricks?: Trick[];
  unassignedGoals?: UnassignedGoal[];
};

function getCaptainId(state: GameState): number {
  const captain = state.players.find(player => player.isCaptain);
  if (!captain) throw new Error('Could not find captain');
  return captain.id;
}

function getDealerName(state: GameState): string {
  const dealer = state.players.find(player => player.isDealer);
  if (!dealer) throw new Error('Could not find dealer');
  return dealer.name;
}

function getPlayerName(state: GameState, playerId: number): string {
  return state.players[playerId].name;
}

function getUnassignedGoalsExist(state: GameState): boolean {
  return !!(state.unassignedGoals ?? []).length;
}

function getIsPlayerDealer(state: GameState, playerId: number): boolean {
  return state.players[playerId].isDealer;
}

function getNumberOfPlayers(state: GameState): number {
  return state.players.length;
}

function getIsGameFinished(state: GameState): boolean {
  const numberOfPlayers = getNumberOfPlayers(state);
  const tricksInGame = Math.floor(40 / numberOfPlayers);
  return !!state.tricks && state.tricks.length === tricksInGame && (state.tricks[tricksInGame - 1].cards ?? []).length === numberOfPlayers;
}

function getAreAllGoalsDone(state: GameState): boolean {
  return !state.players.find(player => player.goals && player.goals.find(goal => !goal.done));
}

function getCurrentTrickId(state: GameState): number {
  if (!state.tricks) {
    return 0;
  }
  return state.tricks.length - 1;
}

function getCurrentTrick(state: GameState): Trick {
  const emptyTrick = { leader: getCaptainId(state) };
  if (!state.tricks) {
    return emptyTrick;
  }
  return state.tricks[getCurrentTrickId(state)] ?? emptyTrick;
}

function getIsBetweenTricks(state: GameState): boolean {
  const currentTrick = getCurrentTrick(state);
  const numberOfPlayers = getNumberOfPlayers(state);
  return !currentTrick.cards || currentTrick.cards.length === 0 || currentTrick.cards.length === numberOfPlayers;
}

function getPlayerHint(state: GameState, playerId: number): Hint {
  return state.players[playerId].hint ?? { used: false };
}

function getPlayerCard(state: GameState, playerId: number, cardIndex: number): Card {
  const hand = getPlayerHand(state, playerId);
  return hand[cardIndex];
}

function getPlayerHand(state: GameState, playerId: number): Card[] {
  const hand = state.players[playerId].hand;
  if (!hand) throw new Error(`Could not find hand for player ${playerId}`);
  return hand;
}

function getLedSuitForCurrentTrick(state: GameState): Suit | null {
  if (getIsBetweenTricks(state)) {
    return null;
  }
  return getCurrentTrick(state).cards!![0].suit;
}

function getPlayerCardsOfSuit(state: GameState, playerId: number, suit: Suit): Card[] {
  const hand = getPlayerHand(state, playerId);
  return hand.filter(card => card.suit === suit);
}

function getNextPlayerId(state: GameState): number {
  if (!state.tricks || !state.tricks.length) {
    return getCaptainId(state);
  }
  const currentTrick = getCurrentTrick(state);
  const numberOfPlayers = getNumberOfPlayers(state);
  if (currentTrick.cards && currentTrick.cards.length === numberOfPlayers) {
    if (currentTrick.winner === undefined) throw new Error ('Finished trick should have a winner');
    return currentTrick.winner;
  }
  return (currentTrick.leader + (currentTrick.cards ? currentTrick.cards.length : 0)) % numberOfPlayers;
}

function getStatusText(state: GameState, playerId: number): string {
  if (getUnassignedGoalsExist(state)) {
    if (getIsPlayerDealer(state, playerId)) {
      return `Discuss the goal cards with your teammates. Press and hold to claim one.\nOnce all goals are claimed, you may start the game.`;
    }
    return `Discuss the goal cards with your teammates. Press and hold to claim one.\n${getDealerName(state)} will start the game once all goals are claimed.`;
  }

  if (getIsGameFinished(state)) {
    if (getAreAllGoalsDone(state)) {
      return `Game complete. You won!`
    }
    return `Game complete. You lost.`
  }

  const nextPlayerId = getNextPlayerId(state);
  if (nextPlayerId === playerId) {
    return `Choose a card to play`;
  }
  return `Waiting for ${getPlayerName(state, nextPlayerId)} to play a card`;
}


function playCard(state: GameState, playerId: number, cardIndex: number): void {
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

  const gameRef = child(child(ref(db), 'games'), 'AAAA');
  set(gameRef, newState);
}

function getHintPlacement(state: GameState, playerId: number, cardIndex: number): HintPlacement {
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

function giveHint(state: GameState, playerId: number, cardIndex: number): void {
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

  const gameRef = child(child(ref(db), 'games'), 'AAAA');
  set(gameRef, newState);
}

function deal(state: GameState, dealerId: number): void {
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

  const gameRef = child(child(ref(db), 'games'), 'AAAA');
  set(gameRef, newState);
}


function resetState() {
  const gameRef = child(child(ref(db), 'games'), 'AAAA');
  set(gameRef, {
    players: [
      {
        id: 0, // should match array index
        name: 'Nathan',
        hand: [{ number: 9, suit: 'blue'}, { number: 7, suit: 'blue' }],
        hint: { used: true, card: { number: 9, suit: 'blue'}, placement: 'top' },
        goals: [{ id: 23, done: false }, { id: 14, done: true }],
        isCaptain: true,
        isDealer: true,
        extraCards: 1,
      },
      {
        id: 1, // should match array index
        name: 'Eric',
        hand: [{ number: 9, suit: 'green'}, { number: 8, suit: 'green' }, { number: 7, suit: 'green' }],
        hint: { used: false },
        goals: [],
        isCaptain: false,
        isDealer: false,
        extraCards: 0,
      },
      {
        id: 2, // should match array index
        name: 'Melora',
        hand: [{ number: 9, suit: 'pink'}, { number: 7, suit: 'yellow' }],
        hint: { used: false },
        goals: [],
        isCaptain: false,
        isDealer: false,
        extraCards: 0,
      }
    ],
    tricks: [
      {
        winner: 0, // Nathan
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
    unassignedGoals: [],
  });
}


export default function Home() {
  const [state, setState] = useState<GameState>({ players: [] });

  useEffect(() => {
    // resetState();
    const gameRef = child(child(ref(db), 'games'), 'AAAA');
    const cleanup = onValue(gameRef, snapshot => {
      setState(snapshot.val());
    });
    return cleanup;
  });

  return (
    <main className={styles.main}>
      {state.players.length ? <><div style={{display: 'flex', justifyContent: 'space-between'}}>
        {state.players.map(player => {
          return <div>
            <div>{player.name} {player.isCaptain ? 'C' : null} {player.extraCards ? `+${player.extraCards}` : null}</div>
            <div>{player.hand ? player.hand.map((card, index) => (<a onClick={() => giveHint(state, player.id, index)}>{card.number}{card.suit} </a>)) : null}</div>
            <div>Hint: {player.hint && player.hint.used ? `${player.hint.card!.number} ${player.hint.card!.suit} ${player.hint.placement}` : null}</div>
            <div>{getStatusText(state, player.id)}</div>
            <div><a onClick={() => deal(state, player.id)}>Deal</a></div>
          </div>;
        })}
      </div>
      <div>
        Current trick:
        {getCurrentTrick(state).cards?.map(card => (<a>{card.number}{card.suit} </a>))}
      </div></> : null }
    </main>
  )
}
