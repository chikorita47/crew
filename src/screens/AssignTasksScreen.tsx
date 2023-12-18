'use client';

import React, { useState } from 'react';
import styles from './assignTasks.module.css';
import Button from '../components/Button';
import { Card, RulesetHintMode } from '../types';
import HandView from '../views/HandView';
import BottomOverlay from '../views/BottomOverlay';
import TaskListView from '../views/TaskListView';

const tasks = [69, 39, 49, 56, 51, 94, 82, 59, 26, 28, 34, 80, 3, 22, 43, 57, 1, 86, 95, 74, 40, 91, 65, 0].map(
  taskId => ({ id: taskId, provisionalPlayerId: taskId % 5 }),
);

const playerNames = ['Nathan', 'Eric', 'Melora', 'Michael', 'Rachel'];

const hand = [
  {
    number: 3,
    suit: 'black',
  },
  {
    number: 2,
    suit: 'black',
  },
  {
    number: 1,
    suit: 'black',
  },
  {
    number: 6,
    suit: 'blue',
  },
  {
    number: 5,
    suit: 'blue',
  },
  {
    number: 2,
    suit: 'blue',
  },
  {
    number: 7,
    suit: 'green',
  },
  {
    number: 2,
    suit: 'green',
  },
  {
    number: 7,
    suit: 'yellow',
  },
  {
    number: 4,
    suit: 'yellow',
  },
  {
    number: 1,
    suit: 'yellow',
  },
  {
    number: 9,
    suit: 'pink',
  },
  {
    number: 2,
    suit: 'pink',
  },
  {
    number: 1,
    suit: 'pink',
  },
];

function AssignTasksScreen() {
  const difficultyIndex = 2;
  const code = 'ABCD';
  const isHost = true;
  const [hintMode, setHintMode] = useState<RulesetHintMode>('default');
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
              checked={hintMode === 'default'}
              onClick={() => setHintMode('default')}
            />
            <label htmlFor="hintModeDefault">Default</label>
            <input
              type="radio"
              id="hintModeFewer"
              name="hintMode"
              value="fewer"
              checked={hintMode === 'fewer'}
              onClick={() => setHintMode('fewer')}
            />
            <label htmlFor="hintModeFewer">2 Fewer</label>
            <input
              type="radio"
              id="hintModeNoTokens"
              name="hintMode"
              value="noTokens"
              checked={hintMode === 'noTokens'}
              onClick={() => setHintMode('noTokens')}
            />
            <label htmlFor="hintModeNoTokens">No Tokens</label>
          </div>
          <Button text="START GAME" onPress={() => {}} />
        </div>
      )}
      <TaskListView tasks={tasks} difficultyIndex={difficultyIndex} playerNames={playerNames} onKick={() => {}} />
      <div className={styles.hand}>
        <HandView hand={hand as Card[]} />
        <BottomOverlay status="Waiting for Michael to play..." code={code} />
      </div>
    </div>
  );
}

export default AssignTasksScreen;
