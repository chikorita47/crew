import React from 'react';
import { Suit } from '@/types';
import styles from './task.module.css';

type Props = {
  suit: Suit;
  size?: number;
};

function SuitSymbol({ size, suit }: Props) {
  return <img src={`images/${suit}-symbol.svg`} height={size} className={styles.suitSymbol} />;
}

export default SuitSymbol;
