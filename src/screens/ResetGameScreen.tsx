'use client';

import React, { useState } from 'react';
import styles from './setupGame.module.css';
import * as Actions from '../actions';
import Button from '../components/Button';
import * as Db from '../firebase';
import { getIsGameFinished, getIsPlayerHost, getNextDealerId } from '../selectors';
import { GameState } from '../types';

type ResetGameScreenProps = {
  state: GameState;
  code: string;
  playerId: number;
  onStartGame: (state: GameState) => void;
  onPressBack: () => void;
};
function ResetGameScreen({ state, code, playerId, onStartGame, onPressBack }: ResetGameScreenProps) {
  const [difficulty, setDifficulty] = useState<number | undefined>(state.difficulty);
  const [dealer, setDealer] = useState<number>(getNextDealerId(state));

  if (!getIsPlayerHost(state, playerId) || !getIsGameFinished(state)) {
    throw new Error('Bad state, showing ResetGameScreen at the wrong time');
  }

  return (
    <div className="center-container">
      <div className={styles.closeButton} onClick={onPressBack}>
        ✕
      </div>
      <div>
        Code: <span className={styles.code}>{code}</span>
      </div>
      <Button
        text="RETRY SAME TASKS"
        onPress={async () => {
          const retryState = Actions.retryGame(state);
          Db.updateState(retryState, code);
          onStartGame(retryState);
        }}
      />
      <div>Players:</div>
      {state.players.map(player => (
        <div key={player.id} onClick={() => setDealer(player.id)}>
          {player.name}
          {player.id === dealer && ' (Dealer)'}
        </div>
      ))}
      <input
        type="number"
        value={difficulty}
        placeholder="Difficulty"
        min={1}
        max={100}
        onChange={event => setDifficulty(event.target.value === '' ? undefined : ~~event.target.value)}
      />
      <Button
        text="DEAL"
        disabled={!difficulty}
        onPress={async () => {
          if (!difficulty) {
            throw new Error('Must enter valid difficulty');
          }
          const redealState = Actions.dealNewGame(state, difficulty, dealer);
          Db.updateState(redealState, code);
          onStartGame(redealState);
        }}
      />
    </div>
  );
}

export default ResetGameScreen;
