'use client';

import React from 'react';
import styles from './taskListView.module.css';

import { TASKS_DATA } from '../data';
import { PlayerTask, UnassignedTask } from '../types';

type TaskListViewProps = {
  tasks: PlayerTask[] | UnassignedTask[];
  difficultyIndex: number;
  playerNames?: string[];
  showHiddenData?: boolean;
  playerId?: number;
  onPress?: (taskId: number) => void;
  onKick?: (taskId: number) => void;
};
function TaskListView({
  tasks,
  difficultyIndex,
  playerNames,
  showHiddenData,
  playerId,
  onPress,
  onKick,
}: TaskListViewProps) {
  return (
    <div className={styles.container}>
      {tasks.map(task => {
        const taskData = TASKS_DATA[task.id];
        const difficulty = taskData.difficulty?.[difficultyIndex];
        const isFinished = 'done' in task && task.done;
        const isFailed = 'failed' in task && task.failed;
        const showExtraData =
          !!task.data &&
          (showHiddenData ||
            task.id === 95 ||
            ('provisionalPlayerId' in task && playerId === task.provisionalPlayerId));
        return (
          <div key={`task-${task.id}`} className={styles.taskCardContainer}>
            <div
              className={[styles.taskCard, isFinished ? styles.finished : null].filter(v => v).join(' ')}
              onClick={onPress ? () => onPress(task.id) : undefined}>
              <div className={styles.taskText}>
                {taskData.text}
                {showExtraData && <b>{` (${task.data!.n})`}</b>}
              </div>
              {taskData.subtext && <div className={styles.taskSubtext}>{taskData.subtext}</div>}
              {'provisionalPlayerId' in task && !!playerNames?.[task.provisionalPlayerId!] && (
                <div className={styles.claimant}>{playerNames![task.provisionalPlayerId!]}</div>
              )}
            </div>
            {!!difficulty && <div className={styles.difficulty}>{difficulty}</div>}
            {isFinished && <div className={[styles.status, styles.success].join(' ')}>✓</div>}
            {isFailed && <div className={[styles.status, styles.fail].join(' ')}>✗</div>}
            {!!onKick && (
              <div className={styles.kick} onClick={() => onKick(task.id)}>
                ✕
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default TaskListView;
