'use client';

import React from 'react';
import styles from './taskListView.module.css';

import { TASKS_DATA } from '../data';
import { PlayerTask, UnassignedTask } from '../types';

type TaskListViewProps = {
  tasks: PlayerTask[] | UnassignedTask[];
  difficultyIndex: number;
};
function TaskListView({ tasks, difficultyIndex }: TaskListViewProps) {
  return (
    <div className={styles.container}>
      {tasks.map(task => {
        const taskData = TASKS_DATA[task.id];
        const isFinished = 'done' in task && task.done;
        const isFailed = 'failed' in task && task.failed;
        return (
          <div key={`task-${task.id}`} className={styles.taskCardContainer}>
            <div className={[styles.taskCard, isFinished ? styles.finished : null].filter(v => v).join(' ')}>
              <div className={styles.taskText}>{taskData.text}</div>
              {taskData.subtext && <div className={styles.taskSubtext}>{taskData.subtext}</div>}
              <div className={styles.difficulty}>{taskData.difficulty[difficultyIndex]}</div>
            </div>
            {isFinished && <div className={[styles.status, styles.success].join(' ')}>✓</div>}
            {isFailed && <div className={[styles.status, styles.fail].join(' ')}>✗</div>}
          </div>
        );
      })}
    </div>
  );
}

export default TaskListView;
