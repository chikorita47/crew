'use client';

import React from 'react';
import { cityMedium } from '../fonts';
import styles from './handView.module.css';
import { Card } from '../types';

type HandViewProps = {
  hand: Card[];
  selectedCardIndex?: number;
  onSelectCard?: (index?: number) => void;
};
function HandView({ hand, selectedCardIndex, onSelectCard }: HandViewProps) {
  return (
    <div className={[styles.hand, cityMedium.className].join(' ')}>
      {hand.map((card, index) => (
        <div
          key={`hand-${index}`}
          className={[styles.card, card.suit, selectedCardIndex === index ? styles.selected : null]
            .filter(v => v)
            .join(' ')}
          // style={selectedCardIndex === index ? { right: '20vw' } : {}}
          onClick={() => {
            if (!onSelectCard) {
              return;
            }
            if (selectedCardIndex === index) {
              return onSelectCard();
            }
            onSelectCard(index);
          }}>
          {card.number}
        </div>
      ))}
    </div>
  );
}

export default HandView;
