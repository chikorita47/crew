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
};
function SelfView({ player, tricksWon, hintMode, onPress }: SelfViewProps) {
  const tasks = Object.values(player.tasks ?? {});
  const tasksDone = tasks.filter(task => task.done).length;
  return (
    <div className={styles.container}>
      <PlayerInfoView player={player} />
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
