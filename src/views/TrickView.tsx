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
};
function TrickView(props: TrickViewProps) {
  return (
    <div className={[styles.trick, cityMedium.className].join(' ')}>
      {props.trick.cards?.map((card, index) => {
        const player = (index + props.trick.leader) % props.numberOfPlayers;
        return (
          <div
            key={`trick-${index}`}
            className={[
              styles.trickCard,
              trickCardStyle(player, props.playerId, props.trick.cards!.length),
              card.suit,
              player === props.trick.winner ? styles.trickWinner : null,
            ]
              .filter(v => v)
              .join(' ')}>
            {card.number}
          </div>
        );
      })}
    </div>
  );
}

export default TrickView;
