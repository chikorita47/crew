'use client';

import React from 'react';
import { cityMedium } from '../fonts';
import styles from './playerStateView.module.css';
import { Hint, RulesetHintMode } from '../types';

type PlayerStateViewProps = {
  hint?: Hint;
  hintMode: RulesetHintMode;
  tasksDone: number;
  tasksTotal: number;
  tricksWon: number;
};
function PlayerStateView({ hint, hintMode, tasksDone, tasksTotal, tricksWon }: PlayerStateViewProps) {
  return (
    <div className={styles.container}>
      {hintMode !== RulesetHintMode.NONE ? (
        hint?.card ? (
          <div className={[styles.hint, styles.given, cityMedium.className, hint.card.suit].join(' ')}>
            {hint.card.number}
            {!!hint.placement && hintMode !== RulesetHintMode.NO_TOKENS && (
              <div className={[styles.token, styles[hint.placement]].join(' ')} />
            )}
          </div>
        ) : (
          <div className={[styles.hint, hint?.used ? styles.used : styles.unused].join(' ')}>
            {hint?.used && <div className={styles.token} />}
          </div>
        )
      ) : null}
      {tasksTotal > 0 && (
        <div className={[styles.tasks, tasksDone === tasksTotal ? styles.complete : null].filter(v => v).join(' ')}>
          <div className={styles.tasksBg}>✓</div>
          {tasksDone}/{tasksTotal}
        </div>
      )}
      {tricksWon > 0 && <div className={styles.tricksWon}>{tricksWon}</div>}
    </div>
  );
}

export default PlayerStateView;
