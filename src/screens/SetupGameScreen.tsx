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
  const [logbookNumber, setLogbookNumber] = useState<number | undefined>();
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
    <div className={styles.container}>
      <div className={styles.codeContainer}>
        Code: <span className={styles.code}>{code}</span>
      </div>
      <div className={styles.playersContainer}>
        <div className={styles.playersHeader}>Players:</div>
        {Object.entries(state.clientList).map(([key, playerName]) => (
          <div key={key} className={styles.playerContainer}>
            {state.host !== playerName && key !== dealer ? (
              <div
                className={styles.playerX}
                onClick={() => {
                  Db.removeProvisionalPlayer(key, code);
                }}>
                {' '}
                ✕
              </div>
            ) : (
              <div className={styles.playerX} />
            )}
            <span className={styles.playerName} onClick={() => setDealer(key)}>
              {playerName}
              {key === dealer && ' (Dealer)'}
            </span>
          </div>
        ))}
      </div>
      <div className={styles.gameSelect}>
        <input
          className={styles.difficultyInput}
          type="number"
          value={difficulty ?? ''}
          placeholder="Difficulty"
          min={1}
          max={100}
          onChange={event => {
            setDifficulty(event.target.value === '' ? undefined : ~~event.target.value);
            setLogbookNumber(undefined);
          }}
        />
        <select
          className={styles.logbookSelect}
          value={logbookNumber ?? 0}
          onChange={event => {
            setLogbookNumber(~~event.target.value || undefined);
            setDifficulty(undefined);
          }}>
          <option value={0}>Normal</option>
          <option value={8}>Mission 8</option>
          <option value={12}>Mission 12</option>
          <option value={21}>Mission 21</option>
          <option value={23}>Mission 23</option>
          <option value={27}>Mission 27</option>
          <option value={32}>Mission 32</option>
        </select>
      </div>
      <div className={styles.hintModeContainer}>
        Hint Mode:
        <div className={styles.hintModeOptions}>
          <div>
            <input
              type="radio"
              id="hintModeDefault"
              name="hintMode"
              value="default"
              checked={hintMode === RulesetHintMode.DEFAULT}
              onClick={() => setHintMode(RulesetHintMode.DEFAULT)}
            />
            <label htmlFor="hintModeDefault">Default</label>
          </div>
          <div>
            <input
              type="radio"
              id="hintModeFewer"
              name="hintMode"
              value="fewer"
              checked={hintMode === RulesetHintMode.FEWER}
              onClick={() => setHintMode(RulesetHintMode.FEWER)}
            />
            <label htmlFor="hintModeFewer">2 Fewer</label>
          </div>
          <div>
            <input
              type="radio"
              id="hintModeNoTokens"
              name="hintMode"
              value="noTokens"
              checked={hintMode === RulesetHintMode.NO_TOKENS}
              onClick={() => setHintMode(RulesetHintMode.NO_TOKENS)}
            />
            <label htmlFor="hintModeNoTokens">No Tokens</label>
          </div>
          <div>
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
        </div>
      </div>
      <Button
        text="DEAL"
        disabled={!canStart || (!difficulty && !logbookNumber)}
        onPress={async () => {
          if (!difficulty && !logbookNumber) {
            throw new Error('Must enter valid difficulty');
          }
          const initialState = await Db.startGame(code);
          const dealerId = getPlayerByKey(initialState, dealer).id;
          const stateWithDealFinished = Actions.setRuleset(
            logbookNumber
              ? Actions.dealNewGameSpecial(initialState, logbookNumber, dealerId)
              : Actions.dealNewGame(initialState, difficulty!, dealerId),
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
