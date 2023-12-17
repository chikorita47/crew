'use client';

import React, { useState } from 'react';
import styles from './game.module.css';
import { Card, Player, Trick } from '../types';
import OtherPlayersView from '../views/OtherPlayersView';
import TrickView from '../views/TrickView';
import SelfView from '../views/SelfView';
import HandView from '../views/HandView';

const hand = [
  {
    number: 3,
    suit: 'black',
  },
  {
    number: 2,
    suit: 'black',
  },
  {
    number: 1,
    suit: 'black',
  },
  {
    number: 6,
    suit: 'blue',
  },
  {
    number: 5,
    suit: 'blue',
  },
  {
    number: 2,
    suit: 'blue',
  },
  {
    number: 7,
    suit: 'green',
  },
  {
    number: 2,
    suit: 'green',
  },
  {
    number: 7,
    suit: 'yellow',
  },
  {
    number: 4,
    suit: 'yellow',
  },
  {
    number: 1,
    suit: 'yellow',
  },
  {
    number: 9,
    suit: 'pink',
  },
  {
    number: 2,
    suit: 'pink',
  },
  {
    number: 1,
    suit: 'pink',
  },
];

const trick = {
  winner: 2,
  leader: 0,
  cards: [
    { number: 3, suit: 'green' },
    { number: 9, suit: 'blue' },
    { number: 5, suit: 'yellow' },
    { number: 5, suit: 'pink' },
    { number: 1, suit: 'black' },
  ],
};

const players = [
  {
    id: 0,
    key: 'AAAA',
    name: 'Nathan',
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
    hint: { used: true },
    tasks: {},
    isCaptain: false,
    isDealer: false,
    extraCards: 0,
  },
  {
    id: 2,
    key: 'CCCC',
    name: 'Melora',
    hint: { used: false },
    isCaptain: false,
    isDealer: false,
    extraCards: 0,
  },
  {
    id: 3,
    key: 'DDDD',
    name: 'Michael',
    hint: { used: false },
    isCaptain: false,
    isDealer: true,
    extraCards: 0,
  },
  {
    id: 4,
    key: 'EEEE',
    name: 'Rachel',
    hint: { used: false },
    isCaptain: false,
    isDealer: false,
    extraCards: 0,
  },
];

function getOtherPlayersOrder(playerId: number, numberOfPlayers: number): number[] {
  const order: number[] = [];
  for (let i = (playerId + 1) % numberOfPlayers; i !== playerId; i = (i + 1) % numberOfPlayers) {
    order.push(i);
  }
  return order;
}

function MainGameScreen() {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | undefined>();
  const numberOfPlayers = trick.cards.length;
  const playerId = 0;
  const self = players[playerId];
  const otherPlayers = getOtherPlayersOrder(playerId, numberOfPlayers).map(id => players[id]);
  const code = 'GHSF';
  return (
    <div className={styles.gameContainer}>
      <div className={styles.upperGameContainer}>
        <OtherPlayersView players={otherPlayers as Player[]} />
      </div>
      <div className={styles.trickContainer}>
        <TrickView trick={trick as Trick} numberOfPlayers={numberOfPlayers} playerId={playerId} />
      </div>
      <div className={styles.lowerGameContainer}>
        <SelfView player={self as Player} />
        <HandView
          hand={hand as Card[]}
          selectedCardIndex={selectedCardIndex}
          onSelectCard={index => setSelectedCardIndex(index)}
        />
        <div className={styles.bottomOverlay}>
          <div className={styles.statusContainer}>Waiting for Michael to play...</div>
          <div className={styles.codeContainer}>{code}</div>
        </div>
      </div>
      {selectedCardIndex !== undefined && (
        <div className={styles.textButtonContainer}>
          <div className={styles.textButton}>PLAY</div>
          <div className={[styles.textButton, styles.disabled].join(' ')}>HINT</div>
        </div>
      )}
      {selectedCardIndex !== undefined && selectedCardIndex !== 0 && (
        <div className={styles.leftButton} onClick={() => setSelectedCardIndex(selectedCardIndex - 1)}>
          ⟨
        </div>
      )}
      {selectedCardIndex !== undefined && selectedCardIndex + 1 !== hand.length && (
        <div className={styles.rightButton} onClick={() => setSelectedCardIndex(selectedCardIndex + 1)}>
          ⟩
        </div>
      )}
    </div>
  );
}

export default MainGameScreen;
