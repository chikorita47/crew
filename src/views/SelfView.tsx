'use client';

import React from 'react';
import styles from './selfView.module.css';
import { Player } from '../types';
import PlayerInfoView from './PlayerInfoView';
import PlayerStateView from './PlayerStateView';

type SelfViewProps = {
  player: Player;
};
function SelfView(props: SelfViewProps) {
  const tasks = Object.values(props.player.tasks ?? {});
  const tasksDone = tasks.filter(task => task.done).length;
  return (
    <div className={styles.container}>
      <PlayerInfoView player={props.player} />
      <PlayerStateView hint={props.player.hint} tasksDone={tasksDone} tasksTotal={tasks.length} tricksWon={2} />
    </div>
  );
}

export default SelfView;
