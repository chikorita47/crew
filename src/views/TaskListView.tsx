'use client';

import React from 'react';
import styles from './taskListView.module.css';

import { TASKS_DATA } from '../data';
import { PlayerTask, UnassignedTask } from '../types';

type TaskListViewProps = {
  tasks: PlayerTask[] | UnassignedTask[];
  difficultyIndex: number;
  playerNames?: string[];
  onPress?: (taskId: number) => void;
  onKick?: (taskId: number) => void;
};
function TaskListView({ tasks, difficultyIndex, playerNames, onPress, onKick }: TaskListViewProps) {
  return (
    <div className={styles.container}>
      {tasks.map(task => {
        const taskData = TASKS_DATA[task.id];
        const isFinished = 'done' in task && task.done;
        const isFailed = 'failed' in task && task.failed;
        return (
          <div key={`task-${task.id}`} className={styles.taskCardContainer}>
            <div
              className={[styles.taskCard, isFinished ? styles.finished : null].filter(v => v).join(' ')}
              onClick={onPress ? () => onPress(task.id) : undefined}>
              <div className={styles.taskText}>{taskData.text}</div>
              {taskData.subtext && <div className={styles.taskSubtext}>{taskData.subtext}</div>}
              <div className={styles.difficulty}>{taskData.difficulty[difficultyIndex]}</div>
            </div>
            {isFinished && <div className={[styles.status, styles.success].join(' ')}>✓</div>}
            {isFailed && <div className={[styles.status, styles.fail].join(' ')}>✗</div>}
            {!!onKick && <div className={styles.kick}>✕</div>}
            {'provisionalPlayerId' in task && !!playerNames?.[task.provisionalPlayerId!] && (
              <div className={styles.claimant}>{playerNames![task.provisionalPlayerId!]}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default TaskListView;
