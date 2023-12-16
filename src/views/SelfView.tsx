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
  return (
    <div className={styles.container}>
      <PlayerInfoView player={props.player} />
      <PlayerStateView hint={props.player.hint} tasksDone={10} tasksTotal={15} tricksWon={2} />
    </div>
  );
}

export default SelfView;
