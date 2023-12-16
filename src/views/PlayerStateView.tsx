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
function PlayerStateView(props: PlayerStateViewProps) {
  return (
    <div className={styles.container}>
      {props.hint?.card ? (
        <div className={[styles.hint, styles.given, cityMedium.className, props.hint.card.suit].join(' ')}>
          {props.hint.card.number}
          {!!props.hint.placement && <div className={[styles.token, styles[props.hint.placement]].join(' ')} />}
        </div>
      ) : (
        <div className={[styles.hint, props.hint?.used ? styles.used : styles.unused].join(' ')} />
      )}
      <div className={styles.tasks}>
        <div className={styles.tasksBg}>✓</div>
        {props.tasksDone}/{props.tasksTotal}
      </div>
      <div className={styles.tricksWon}>{props.tricksWon}</div>
    </div>
  );
}

export default PlayerStateView;
