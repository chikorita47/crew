'use client';

import React, { useState } from 'react';
import styles from './setupGame.module.css';
import * as Actions from '../actions';
import Button from '../components/Button';
import * as Db from '../firebase';
import { getPlayerByKey } from '../selectors';
import { GameState, ProvisionalGame } from '../types';

type SetupGameScreenProps = {
  state: ProvisionalGame;
  code: string;
  playerKey: string;
  onStartGame: (state: GameState) => void;
};
function SetupGameScreen({ state, code, playerKey, onStartGame }: SetupGameScreenProps) {
  const [difficulty, setDifficulty] = useState<number | undefined>();
  const [dealer, setDealer] = useState<string>(playerKey);

  const isHost = state.host === state.clientList[playerKey];
  const hostName = state.host;
  if (!isHost) {
    return <div className="center-container">Waiting for {hostName} to start the game...</div>;
  }

  const numberOfPlayers = Object.keys(state.clientList).length;
  const canStart = numberOfPlayers >= 3 && numberOfPlayers <= 5;
  return (
    <div className="center-container">
      <div>
        Code: <span className={styles.code}>{code}</span>
      </div>
      <div>Players:</div>
      {Object.entries(state.clientList).map(([key, playerName]) => (
        <div key={key}>
          <span onClick={() => setDealer(key)}>{playerName}</span>
          {key === dealer && ' (Dealer)'}
          {state.host !== playerName && key !== dealer && (
            <span
              onClick={() => {
                Db.removeProvisionalPlayer(key, code);
              }}>
              {' '}
              ✕
            </span>
          )}
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
        disabled={!canStart || !difficulty}
        onPress={async () => {
          if (!difficulty) {
            throw new Error('Must enter valid difficulty');
          }
          const initialState = await Db.startGame(code);
          const dealerId = getPlayerByKey(initialState, dealer).id;
          const stateWithDealFinished = Actions.dealPlayerHands(Actions.dealTasks(initialState, difficulty), dealerId);
          Db.updateState(stateWithDealFinished, code);
          onStartGame(stateWithDealFinished);
        }}
      />
    </div>
  );
}

export default SetupGameScreen;
