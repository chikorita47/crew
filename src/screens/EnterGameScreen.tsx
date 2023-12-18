'use client';

import React, { useState } from 'react';
import styles from './enterGame.module.css';
import Button from '../components/Button';

function EnterGameScreen() {
  const [name, setName] = useState<string | undefined>();
  const [code, setCode] = useState<string | undefined>();

  return (
    <div className={styles.container}>
      <input type="text" value={name} placeholder="Name" onChange={event => setName(event.target.value)} />
      <input type="text" value={code} placeholder="Code" onChange={event => setCode(event.target.value)} />
      <Button text="CREATE GAME" onPress={() => {}} />
      <Button text="JOIN GAME" onPress={() => {}} />
    </div>
  );
}

export default EnterGameScreen;
