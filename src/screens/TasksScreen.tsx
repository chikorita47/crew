'use client';

import localFont from 'next/font/local';
import React from 'react';
import styles from './tasks.module.css';

import { TASKS_DATA } from '../data';

const cityMedium = localFont({ src: '../fonts/City Medium.ttf', display: 'swap' });

const tasks = [69, 39, 49, 56, 51, 94, 82, 59, 26, 28, 34, 80, 3, 22, 43, 57, 1, 86, 95, 74, 40, 91, 65, 0];

function TasksScreen() {
  const difficultyIndex = 2;
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>Nathan&apos;s Tasks</div>
        <div className={styles.hint}>
          Hint: <span className={[styles.hintCard, 'green', cityMedium.className].join(' ')}>3</span> is my <b>only</b>{' '}
          green
        </div>
        <div className={styles.closeButton}>✕</div>
      </div>
      <div className={styles.tasksContainer}>
        {tasks.map(taskId => {
          const task = TASKS_DATA[taskId];
          const isFinished = taskId % 2;
          return (
            <div key={`task-${taskId}`} className={styles.taskCardContainer}>
              <div className={[styles.taskCard, isFinished ? styles.finished : null].filter(v => v).join(' ')}>
                <div className={styles.taskText}>{task.text}</div>
                {task.subtext && <div className={styles.taskSubtext}>{task.subtext}</div>}
                <div className={styles.difficulty}>{task.difficulty[difficultyIndex]}</div>
              </div>
              {!!isFinished && <div className={[styles.status, styles.success].join(' ')}>✓</div>}
              {/* {!!isFinished && <div className={[styles.status, styles.fail].join(' ')}>✗</div>} */}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TasksScreen;
