'use client';

import React from 'react';
import styles from './otherPlayersView.module.css';
import { Player } from '../types';
import PlayerInfoView from './PlayerInfoView';
import PlayerStateView from './PlayerStateView';

type OtherPlayersViewProps = {
  players: Player[];
};
function OtherPlayersView(props: OtherPlayersViewProps) {
  const numberOfPlayers = props.players.length + 1;
  return (
    <div className={styles[`players${numberOfPlayers}Container`]}>
      {props.players.map((player, index) => {
        const containerStyle = styles[`players${numberOfPlayers}Container${index + 1}`];
        return (
          <div key={`player-${player.id}`} className={[styles.playerContainer, containerStyle].join(' ')}>
            <PlayerInfoView player={player} />
            <PlayerStateView hint={player.hint} tasksDone={10} tasksTotal={15} tricksWon={2} />
          </div>
        );
      })}
    </div>
  );
}

export default OtherPlayersView;
