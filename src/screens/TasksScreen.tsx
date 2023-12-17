'use client';

import localFont from 'next/font/local';
import React from 'react';
import styles from './tasks.module.css';

import TaskListView from '@/views/TaskListView';

const cityMedium = localFont({ src: '../fonts/City Medium.ttf', display: 'swap' });

const tasks = [69, 39, 49, 56, 51, 94, 82, 59, 26, 28, 34, 80, 3, 22, 43, 57, 1, 86, 95, 74, 40, 91, 65, 0].map(
  taskId => ({ id: taskId, done: !!(taskId % 2), failed: !(taskId % 9) }),
);

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
      <TaskListView tasks={tasks} difficultyIndex={difficultyIndex} />
    </div>
  );
}

export default TasksScreen;
