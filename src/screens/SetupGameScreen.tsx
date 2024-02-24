'use client';

import React, { useState } from 'react';
import styles from './setupGame.module.css';
import * as Actions from '../actions';
import Button from '../components/Button';
import * as Db from '../firebase';
import { getPlayerByKey } from '../selectors';
import { GameState, ProvisionalGame, Ruleset, RulesetHintMode } from '../types';

type SetupGameScreenProps = {
  state: ProvisionalGame;
  code: string;
  playerKey: string;
  onStartGame: (state: GameState) => void;
};
function SetupGameScreen({ state, code, playerKey, onStartGame }: SetupGameScreenProps) {
  const [difficulty, setDifficulty] = useState<number | undefined>();
  const [dealer, setDealer] = useState<string>(playerKey);
  const [hintMode, setHintMode] = useState<RulesetHintMode>(RulesetHintMode.DEFAULT);
  // const [timeInSeconds, setTimeInSeconds] = useState<number | undefined>();

  const isHost = state.host === state.clientList[playerKey];
  const hostName = state.host;
  if (!isHost) {
    return <div className="center-container">Waiting for {hostName} to start the game...</div>;
  }

  const ruleset: Ruleset = { hintMode };
  // if (timeInSeconds) {
  //   ruleset.timeInSeconds = timeInSeconds;
  // }

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
      <div className={styles.hintModeContainer}>
        Hint Mode:
        <input
          type="radio"
          id="hintModeDefault"
          name="hintMode"
          value="default"
          checked={hintMode === RulesetHintMode.DEFAULT}
          onClick={() => setHintMode(RulesetHintMode.DEFAULT)}
        />
        <label htmlFor="hintModeDefault">Default</label>
        <input
          type="radio"
          id="hintModeFewer"
          name="hintMode"
          value="fewer"
          checked={hintMode === RulesetHintMode.FEWER}
          onClick={() => setHintMode(RulesetHintMode.FEWER)}
        />
        <label htmlFor="hintModeFewer">2 Fewer</label>
        <input
          type="radio"
          id="hintModeNoTokens"
          name="hintMode"
          value="noTokens"
          checked={hintMode === RulesetHintMode.NO_TOKENS}
          onClick={() => setHintMode(RulesetHintMode.NO_TOKENS)}
        />
        <label htmlFor="hintModeNoTokens">No Tokens</label>
        <input
          type="radio"
          id="hintModeNone"
          name="hintMode"
          value="none"
          checked={hintMode === RulesetHintMode.NONE}
          onClick={() => setHintMode(RulesetHintMode.NONE)}
        />
        <label htmlFor="hintModeNone">No Hints</label>
      </div>
      <Button
        text="DEAL"
        disabled={!canStart || !difficulty}
        onPress={async () => {
          if (!difficulty) {
            throw new Error('Must enter valid difficulty');
          }
          const initialState = await Db.startGame(code);
          const dealerId = getPlayerByKey(initialState, dealer).id;
          const stateWithDealFinished = Actions.setRuleset(
            Actions.dealPlayerHands(Actions.dealTasks(initialState, difficulty), dealerId),
            ruleset,
          );
          Db.updateState(stateWithDealFinished, code);
          onStartGame(stateWithDealFinished);
        }}
      />
    </div>
  );
}

export default SetupGameScreen;
