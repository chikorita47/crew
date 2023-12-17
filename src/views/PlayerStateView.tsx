'use client';

import React from 'react';
import { cityMedium } from '../fonts';
import styles from './playerStateView.module.css';
import { Hint } from '../types';

type PlayerStateViewProps = {
  hint?: Hint;
  tasksDone: number;
  tasksTotal: number;
  tricksWon: number;
};
function PlayerStateView({ hint, tasksDone, tasksTotal, tricksWon }: PlayerStateViewProps) {
  return (
    <div className={styles.container}>
      {hint?.card ? (
        <div className={[styles.hint, styles.given, cityMedium.className, hint.card.suit].join(' ')}>
          {hint.card.number}
          {!!hint.placement && <div className={[styles.token, styles[hint.placement]].join(' ')} />}
        </div>
      ) : (
        <div className={[styles.hint, hint?.used ? styles.used : styles.unused].join(' ')} />
      )}
      {tasksTotal > 0 && (
        <div className={styles.tasks}>
          <div className={styles.tasksBg}>✓</div>
          {tasksDone}/{tasksTotal}
        </div>
      )}
      {tricksWon > 0 && <div className={styles.tricksWon}>{tricksWon}</div>}
    </div>
  );
}

export default PlayerStateView;
