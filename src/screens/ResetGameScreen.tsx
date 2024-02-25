'use client';

import React, { useState } from 'react';
import styles from './setupGame.module.css';
import * as Actions from '../actions';
import Button from '../components/Button';
import * as Db from '../firebase';
import { getIsPlayerHost, getNextDealerId } from '../selectors';
import { GameState, Ruleset, RulesetHintMode } from '../types';

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
  const [hintMode, setHintMode] = useState<RulesetHintMode>(RulesetHintMode.DEFAULT);
  const [logbookNumber, setLogbookNumber] = useState<number | undefined>();
  // const [timeInSeconds, setTimeInSeconds] = useState<number | undefined>();

  if (!getIsPlayerHost(state, playerId)) {
    throw new Error('Non-host player should not see ResetGameScreen');
  }

  const ruleset: Ruleset = { hintMode };
  // if (timeInSeconds) {
  //   ruleset.timeInSeconds = timeInSeconds;
  // }

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
        value={logbookNumber ?? 0}
        onChange={event => {
          setLogbookNumber(~~event.target.value || undefined);
          setDifficulty(undefined);
        }}>
        <option value={0}>None</option>
        <option value={8}>Mission 8</option>
        <option value={12}>Mission 12</option>
        <option value={21}>Mission 21</option>
        <option value={23}>Mission 23</option>
        <option value={27}>Mission 27</option>
        <option value={32}>Mission 32</option>
      </select>
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
        disabled={!difficulty && !logbookNumber}
        onPress={async () => {
          if (!difficulty && !logbookNumber) {
            throw new Error('Must enter valid difficulty');
          }
          const redealState = Actions.setRuleset(
            logbookNumber
              ? Actions.dealNewGameSpecial(state, logbookNumber, dealer)
              : Actions.dealNewGame(state, difficulty!, dealer),
            ruleset,
          );
          Db.updateState(redealState, code);
          onStartGame(redealState);
        }}
      />
    </div>
  );
}

export default ResetGameScreen;
