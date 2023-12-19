'use client';

import React from 'react';
import styles from './selfView.module.css';
import { Player, RulesetHintMode } from '../types';
import PlayerInfoView from './PlayerInfoView';
import PlayerStateView from './PlayerStateView';

type SelfViewProps = {
  player: Player;
  tricksWon: number;
  hintMode: RulesetHintMode;
  onPress: () => void;
  onPressUndo?: () => void;
};
function SelfView({ player, tricksWon, hintMode, onPress, onPressUndo }: SelfViewProps) {
  const tasks = Object.values(player.tasks ?? {});
  const tasksDone = tasks.filter(task => task.done).length;
  return (
    <div className={styles.container}>
      <div>
        {!!onPressUndo && (
          <div className={styles.undo} onClick={onPressUndo}>
            ⎌
          </div>
        )}
        <PlayerInfoView player={player} />
      </div>
      <div onClick={onPress}>
        <PlayerStateView
          hint={player.hint}
          hintMode={hintMode}
          tasksDone={tasksDone}
          tasksTotal={tasks.length}
          tricksWon={tricksWon}
        />
      </div>
    </div>
  );
}

export default SelfView;
