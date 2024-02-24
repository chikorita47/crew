'use client';

import React, { useState } from 'react';
import styles from './assignTasks.module.css';
import * as Actions from '../actions';
import Button from '../components/Button';
import ExtraCardsSymbol from '../components/ExtraCardsSymbol';
import Modal from '../components/Modal';
import * as Db from '../firebase';
import * as Selectors from '../selectors';
import { GameState, UnassignedTask } from '../types';
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

  if (!Selectors.getUnassignedTasksExist(state)) {
    throw new Error('Should not be rendering AssignTasksView when there are no unassigned tasks');
  }

  const difficultyIndex = Selectors.getNumberOfPlayers(state) - 3;
  const unassignedTasks = Selectors.getUnassignedTasks(state);
  // TODO: make this better
  const taskRequiringExtraData =
    taskRequiringExtraDataOrNull(unassignedTasks[94], playerId) ??
    taskRequiringExtraDataOrNull(unassignedTasks[95], playerId);

  const hasExtraCards = !!Selectors.getPlayer(state, playerId).extraCards;
  return (
    <div className={styles.container}>
      {isHost && (
        <div className={styles.header}>
          <div className={styles.buttonContainer}>
            <Button
              text="RE-DEAL"
              onPress={() => Db.updateState(Actions.dealPlayerHands(state, Selectors.getDealerId(state)), code)}
            />
            <Button
              text="START GAME"
              disabled={!Selectors.getAreAllTasksAssigned(state)}
              onPress={() => {
                const newState = Actions.finalizeTasksAndStartGame(state);
                Db.updateState(newState, code);
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
        onPress={taskId => Db.updateState(Actions.toggleClaimTask(state, playerId, taskId), code)}
        onKick={isHost ? taskId => Db.updateState(Actions.kickTask(state, taskId), code) : undefined}
      />
      <div className={[styles.hand, hasExtraCards ? styles.handWithExtraCardsSymbol : null].filter(v => v).join(' ')}>
        {hasExtraCards && <ExtraCardsSymbol />}
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
            Db.updateState(Actions.addDataToTask(state, playerId, taskRequiringExtraData.id, { n: value }), code)
          }
        />
      )}
    </div>
  );
}

export default AssignTasksScreen;
