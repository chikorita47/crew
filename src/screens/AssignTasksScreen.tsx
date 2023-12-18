'use client';

import React, { useState } from 'react';
import styles from './assignTasks.module.css';
import * as Actions from '../actions';
import Button from '../components/Button';
import Modal from '../components/Modal';
import * as Selectors from '../selectors';
import { GameState, Ruleset, RulesetHintMode, UnassignedTask } from '../types';
import HandView from '../views/HandView';
import BottomOverlay from '../views/BottomOverlay';
import TaskListView from '../views/TaskListView';

type XTricksSelectorViewProps = {
  onSubmit: (value: number) => void;
};
function XTricksSelectorView(props: XTricksSelectorViewProps) {
  const [value, setValue] = useState<number | undefined>();
  return (
    <Modal>
      <div className={styles.xTricksModal}>
        Enter value for X:
        <input
          type="number"
          value={value}
          min={1}
          max={100}
          onChange={event => setValue(event.target.value === '' ? undefined : ~~event.target.value)}
        />
        <Button text="OK" onPress={() => props.onSubmit(value!)} disabled={value === undefined} />
      </div>
    </Modal>
  );
}

function taskRequiringExtraDataOrNull(task: UnassignedTask, playerId: number): UnassignedTask | null {
  return !!task && 'provisionalPlayerId' in task && playerId === task.provisionalPlayerId && !task.data ? task : null;
}

type AssignTaskScreenProps = {
  state: GameState;
  code: string;
  playerId: number;
  onFinalizeTasks: (state: GameState) => void;
};
function AssignTasksScreen({ state, code, playerId, onFinalizeTasks }: AssignTaskScreenProps) {
  const isHost = Selectors.getIsPlayerHost(state, playerId);
  const [hintMode, setHintMode] = useState<RulesetHintMode>(RulesetHintMode.DEFAULT);
  // const [timeInSeconds, setTimeInSeconds] = useState<number | undefined>();

  if (!Selectors.getUnassignedTasksExist(state)) {
    throw new Error('Should not be rendering AssignTasksView when there are no unassigned tasks');
  }

  const difficultyIndex = Selectors.getNumberOfPlayers(state) - 3;
  const ruleset: Ruleset = { hintMode };
  // if (timeInSeconds) {
  //   ruleset.timeInSeconds = timeInSeconds;
  // }

  const unassignedTasks = Selectors.getUnassignedTasks(state);
  // TODO: make this better
  const taskRequiringExtraData =
    taskRequiringExtraDataOrNull(unassignedTasks[94], playerId) ??
    taskRequiringExtraDataOrNull(unassignedTasks[95], playerId);
  return (
    <div className={styles.container}>
      {isHost && (
        <div className={styles.header}>
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
          </div>
          <div className={styles.buttonContainer}>
            <Button
              text="RE-DEAL"
              onPress={() => Actions.updateState(Actions.dealPlayerHands(state, Selectors.getDealerId(state)), code)}
            />
            <Button
              text="START GAME"
              disabled={!Selectors.getAreAllTasksAssigned(state)}
              onPress={() => {
                const newState = Actions.finalizeTasksAndRuleset(state, ruleset);
                Actions.updateState(newState, code);
                onFinalizeTasks(newState);
              }}
            />
          </div>
        </div>
      )}
      <TaskListView
        tasks={Selectors.getUnassignedTasksOrdered(state)}
        difficultyIndex={difficultyIndex}
        playerNames={Selectors.getPlayerNamesById(state)}
        playerId={playerId}
        onPress={taskId => Actions.updateState(Actions.toggleClaimTask(state, playerId, taskId), code)}
        onKick={isHost ? taskId => Actions.updateState(Actions.kickTask(state, taskId), code) : undefined}
      />
      <div className={styles.hand}>
        <HandView hand={Selectors.getPlayerHand(state, playerId)} />
        <BottomOverlay
          status={Selectors.getStatusText(state, playerId)}
          code={code}
          difficulty={Selectors.getDifficulty(state)}
        />
      </div>
      {!!taskRequiringExtraData && (
        <XTricksSelectorView
          onSubmit={value =>
            Actions.updateState(Actions.addDataToTask(state, playerId, taskRequiringExtraData.id, { n: value }), code)
          }
        />
      )}
    </div>
  );
}

export default AssignTasksScreen;
