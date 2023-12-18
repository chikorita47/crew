'use client';

import React, { useState } from 'react';
import styles from './enterGame.module.css';
import { createGame, joinGame } from '../actions';
import Button from '../components/Button';

type EnterGameScreenProps = {
  onEnterGame: (code: string, key: string) => void;
};
function EnterGameScreen(props: EnterGameScreenProps) {
  const [name, setName] = useState<string | undefined>();
  const [code, setCode] = useState<string | undefined>();

  return (
    <div className={styles.container}>
      <input type="text" value={name} placeholder="Name" onChange={event => setName(event.target.value)} />
      <input
        type="text"
        value={code}
        placeholder="Code"
        onChange={event => setCode(event.target.value.toUpperCase())}
      />
      {!code ? (
        <Button
          text="CREATE GAME"
          disabled={!name}
          onPress={async () => {
            if (!name) {
              throw new Error('Must enter name');
            }
            const { code, key } = await createGame(name);
            props.onEnterGame(code, key);
          }}
        />
      ) : (
        <Button
          text="JOIN GAME"
          disabled={!name || !code}
          onPress={async () => {
            if (!name || !code) {
              throw new Error('Must enter name and code');
            }
            const key = await joinGame(name, code);
            props.onEnterGame(code, key);
          }}
        />
      )}
    </div>
  );
}

export default EnterGameScreen;
