'use client';

import React from 'react';
import * as Actions from '../actions';
import * as Db from '../firebase';
import { cityMedium } from '../fonts';
import * as Selectors from '../selectors';
import styles from './tasks.module.css';
import { GameState, HintPlacement, RulesetHintMode } from '../types';
import TaskListView from '../views/TaskListView';

const placementString = {
  [HintPlacement.TOP]: 'highest',
  [HintPlacement.MIDDLE]: 'only',
  [HintPlacement.BOTTOM]: 'lowest',
};

type TasksScreenProps = {
  state: GameState;
  code: string;
  playerId: number;
  isSelf: boolean;
  onClose: () => void;
};
function TasksScreen({ state, code, playerId, isSelf, onClose }: TasksScreenProps) {
  const tasks = Selectors.getPlayerTasks(state, playerId);
  const hint = Selectors.getPlayerHint(state, playerId);
  const hintMode = Selectors.getHintMode(state);
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>{Selectors.getPlayerName(state, playerId)}&apos;s Tasks</div>
        {!!hint && !!hint.card && (
          <div className={styles.hint}>
            Hint:{' '}
            <span className={[styles.hintCard, hint.card.suit, cityMedium.className].join(' ')}>
              {hint.card.number}
            </span>{' '}
            {hintMode === RulesetHintMode.NO_TOKENS ? (
              <>(no tokens)</>
            ) : (
              <>
                is my <b>{placementString[hint.placement!]}</b> {hint.card.suit}
              </>
            )}
          </div>
        )}
        <div className={styles.closeButton} onClick={onClose}>
          ✕
        </div>
      </div>
      <TaskListView
        tasks={Object.values(tasks)}
        difficultyIndex={Selectors.getNumberOfPlayers(state) - 3}
        showHiddenData={isSelf}
        onPress={isSelf ? taskId => Db.updateState(Actions.toggleTaskDone(state, playerId, taskId), code) : undefined}
      />
    </div>
  );
}

export default TasksScreen;
