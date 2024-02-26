import React from 'react';
import styles from './task.module.css';
import { Comparison } from '@/types';

type Props = {
  comparison: Comparison;
};

function PlayersSymbol({ comparison }: Props) {
  comparison;
  return <div className={styles.playersSymbol}>♟️</div>;
}

export default PlayersSymbol;
