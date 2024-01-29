'use client';

import React from 'react';
import ExtraCardsSymbol from '../components/ExtraCardsSymbol';
import styles from './playerInfoView.module.css';
import { Player } from '../types';

type PlayerInfoViewProps = {
  player: Player;
};
function PlayerInfoView(props: PlayerInfoViewProps) {
  return (
    <div className={styles.container}>
      <div>{props.player.name}</div>
      {props.player.isCaptain && <div className={styles.captain}>C</div>}
      {!!props.player.extraCards && <ExtraCardsSymbol />}
    </div>
  );
}

export default PlayerInfoView;
