'use client';

import React from 'react';
import styles from './otherPlayersView.module.css';
import { Player, RulesetHintMode } from '../types';
import PlayerInfoView from './PlayerInfoView';
import PlayerStateView from './PlayerStateView';

type OtherPlayersViewProps = {
  players: Player[];
  tricksWonByPlayers: number[];
  hintMode: RulesetHintMode;
  onPressPlayer: (playerId: number) => void;
};
function OtherPlayersView({ players, tricksWonByPlayers, hintMode, onPressPlayer }: OtherPlayersViewProps) {
  const numberOfPlayers = players.length + 1;
  return (
    <div className={styles[`players${numberOfPlayers}Container`]}>
      {players.map((player, index) => {
        const containerStyle = styles[`players${numberOfPlayers}Container${index + 1}`];
        const tasks = Object.values(player.tasks ?? {});
        const tasksDone = tasks.filter(task => task.done).length;
        return (
          <div
            key={`player-${player.id}`}
            className={[styles.playerContainer, containerStyle].join(' ')}
            onClick={() => onPressPlayer(player.id)}>
            <PlayerInfoView player={player} />
            <PlayerStateView
              hint={player.hint}
              hintMode={hintMode}
              tasksDone={tasksDone}
              tasksTotal={tasks.length}
              tricksWon={tricksWonByPlayers[player.id]}
            />
          </div>
        );
      })}
    </div>
  );
}

export default OtherPlayersView;
