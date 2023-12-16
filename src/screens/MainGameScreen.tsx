'use client';

import localFont from 'next/font/local';
import React, { useState } from 'react';
import styles from './game.module.css';

const cityMedium = localFont({ src: '../fonts/City Medium.ttf', display: 'swap' });

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
  winner: 3,
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

function trickCardStyle(index: number, playerId: number, numberOfPlayers: number) {
  const styleIndex = (index - playerId + numberOfPlayers) % numberOfPlayers;
  if (numberOfPlayers === 5) {
    return styles[`trick5Card${styleIndex}`];
  }
  if (numberOfPlayers === 3 && styleIndex === 2) {
    return styles.trickCard3;
  }
  return styles[`trickCard${styleIndex}`];
}

const suitToStyle: { [key: string]: string } = {
  blue: styles.blue,
  green: styles.green,
  yellow: styles.yellow,
  pink: styles.pink,
  black: styles.black,
};

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
  return (
    <div className={styles.gameContainer}>
      <div className={styles.upperGameContainer}>
        <div className={styles[`players${numberOfPlayers}Container`]}>
          {otherPlayers.map((player, index) => {
            const containerStyle = styles[`players${numberOfPlayers}Container${index + 1}`];
            return (
              <div key={`player-${player.id}`} className={[styles.playerContainer, containerStyle].join(' ')}>
                <div className={styles.playerNameContainer}>
                  <div>{player.name}</div>
                  {player.isCaptain && <div className={styles.captain}>C</div>}
                  {!!player.extraCards && <div className={styles.extraCards}>+1</div>}
                </div>
                <div className={styles.playerStateContainer}>
                  {player.hint?.card ? (
                    <div
                      className={[
                        styles.hint,
                        styles.given,
                        cityMedium.className,
                        suitToStyle[player.hint.card.suit],
                      ].join(' ')}>
                      {player.hint.card.number}
                      <div className={[styles.token, styles[player.hint.placement]].join(' ')} />
                    </div>
                  ) : (
                    <div className={[styles.hint, player.hint?.used ? styles.used : styles.unused].join(' ')} />
                  )}
                  <div className={styles.tasks}>
                    <div className={styles.tasksBg}>✓</div>15/15
                  </div>
                  <div className={styles.tricksWon}>2</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.trickContainer}>
        <div className={[styles.trick, cityMedium.className].join(' ')}>
          {trick.cards.map((card, index) => {
            const player = (index + trick.leader) % numberOfPlayers;
            return (
              <div
                key={`trick-${index}`}
                className={[
                  styles.trickCard,
                  trickCardStyle(player, playerId, trick.cards.length),
                  suitToStyle[card.suit],
                  player === trick.winner ? styles.trickWinner : null,
                ]
                  .filter(v => v)
                  .join(' ')}>
                {card.number}
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.lowerGameContainer}>
        <div className={styles.selfDataContainer}>
          <div className={styles.playerNameContainer}>
            <div>{self.name}</div>
            {self.isCaptain && <div className={styles.captain}>C</div>}
            {!!self.extraCards && <div className={styles.extraCards}>+1</div>}
          </div>
          <div className={styles.playerStateContainer}>
            {self.hint?.card ? (
              <div
                className={[styles.hint, styles.given, cityMedium.className, suitToStyle[self.hint.card.suit]].join(
                  ' ',
                )}>
                {self.hint.card.number}
                <div className={[styles.token, styles[self.hint.placement]].join(' ')} />
              </div>
            ) : (
              <div className={[styles.hint, self.hint?.used ? styles.used : styles.unused].join(' ')} />
            )}
            <div className={styles.tasks}>
              <div className={styles.tasksBg}>✓</div>15/15
            </div>
            <div className={styles.tricksWon}>2</div>
          </div>
        </div>
        <div className={[styles.hand, cityMedium.className].join(' ')}>
          {hand.map((card, index) => (
            <div
              key={`hand-${index}`}
              className={[styles.card, suitToStyle[card.suit], selectedCardIndex === index ? styles.selected : null]
                .filter(v => v)
                .join(' ')}
              // style={selectedCardIndex === index ? { right: '20vw' } : {}}
              onClick={() => {
                if (selectedCardIndex === index) {
                  return setSelectedCardIndex(undefined);
                }
                setSelectedCardIndex(index);
              }}>
              {card.number}
            </div>
          ))}
        </div>
        <div className={styles.statusContainer}>Waiting for Michael to play...</div>
      </div>
      {selectedCardIndex !== undefined && (
        <div className={styles.textButtonContainer}>
          <div className={styles.textButton}>PLAY</div>
          <div className={styles.textButton}>HINT</div>
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
