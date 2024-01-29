'use client';

import React from 'react';
import { cityMedium } from '../fonts';
import styles from './trickView.module.css';
import { Trick } from '../types';

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

type TrickViewProps = {
  trick: Trick;
  numberOfPlayers: number;
  playerId: number;
  nextPlayerId: number;
};
function TrickView({ trick, numberOfPlayers, playerId, nextPlayerId }: TrickViewProps) {
  const shouldShowNextCardSpot = !trick.cards || trick.cards.length < numberOfPlayers;
  return (
    <div className={[styles.trick, cityMedium.className].join(' ')}>
      {trick.cards?.map((card, index) => {
        const player = (index + trick.leader) % numberOfPlayers;
        return (
          <div
            key={`trick-${index}`}
            className={[
              styles.trickCard,
              trickCardStyle(player, playerId, numberOfPlayers),
              card.suit,
              player === trick.winner ? styles.trickWinner : null,
            ]
              .filter(v => v)
              .join(' ')}>
            {card.number}
          </div>
        );
      })}
      {shouldShowNextCardSpot && (
        <div className={[styles.trickCardEmpty, trickCardStyle(nextPlayerId, playerId, numberOfPlayers)].join(' ')} />
      )}
    </div>
  );
}

export default TrickView;
