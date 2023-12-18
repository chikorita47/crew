'use client';

import React, { useState } from 'react';
import styles from './setupGame.module.css';
import Button from '../components/Button';

const clientList = {
  AAAA: 'Nathan',
  BBBB: 'Eric',
  CCCC: 'Melora',
  DDDD: 'Michael',
  EEEE: 'Rachel',
};

function SetupGameScreen() {
  const [difficulty, setDifficulty] = useState<number | undefined>();
  const [dealer, setDealer] = useState<string>('AAAA');

  const isHost = true;
  const hostName = 'Nathan';
  const code = 'ASDF';
  if (!isHost) {
    return <div className={styles.container}>Waiting for {hostName} to start the game...</div>;
  }

  return (
    <div className={styles.container}>
      <div>Code: {code}</div>
      <div>Players:</div>
      {Object.entries(clientList).map(([key, playerName]) => (
        <div key={key} onClick={() => setDealer(key)}>
          {playerName}
          {key === dealer && ' (Dealer)'}
        </div>
      ))}
      <input
        type="number"
        value={difficulty}
        placeholder="Difficulty"
        min={1}
        max={100}
        onChange={event => setDifficulty(~~event.target.value)}
      />
      <Button text="DEAL" onPress={() => {}} />
    </div>
  );
}

export default SetupGameScreen;
