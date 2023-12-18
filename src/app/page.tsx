'use client';

import { child, onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';

import db from '../firebase';
import AssignTasksScreen from '../screens/AssignTasksScreen';
import EnterGameScreen from '../screens/EnterGameScreen';
import MainGameScreen from '../screens/MainGameScreen';
import SetupGameScreen from '../screens/SetupGameScreen';
import TasksScreen from '../screens/TasksScreen';
// import TextGameScreen from '../screens/TextGame';
import * as Selectors from '../selectors';
import { GameState, ProvisionalGame } from '../types';

function App() {
  const [code, setCode] = useState<string | undefined>();
  const [key, setKey] = useState<string | undefined>();
  const [playerId, setPlayerId] = useState<number | undefined>();
  const [showTasksForPlayer, setShowTasksForPlayer] = useState<number | undefined>();

  const [state, setState] = useState<GameState | ProvisionalGame>();
  useEffect(() => {
    if (code) {
      const gameRef = child(child(ref(db), 'games'), code);
      const cleanup = onValue(gameRef, snapshot => {
        setState(snapshot.val());
      });
      return cleanup;
    }
  }, [code]);

  if (!code || !key) {
    return (
      <EnterGameScreen
        onEnterGame={(code, key) => {
          setCode(code);
          setKey(key);
        }}
      />
    );
  }

  if (!state || 'host' in state) {
    return (
      <SetupGameScreen
        state={state}
        code={code}
        playerKey={key}
        onStartGame={newState => {
          setPlayerId(Selectors.getPlayerByKey(newState, key).id);
          setState(newState);
        }}
      />
    );
  }

  if (playerId === undefined) {
    setPlayerId(Selectors.getPlayerByKey(state, key).id);
    return <div>Re-entering game...</div>;
  }

  if (Selectors.getUnassignedTasksExist(state)) {
    return (
      <AssignTasksScreen
        state={state}
        code={code}
        playerId={playerId}
        onFinalizeTasks={newState => {
          setState(newState);
        }}
      />
    );
  }

  if (showTasksForPlayer !== undefined) {
    return (
      <TasksScreen
        state={state}
        code={code}
        playerId={showTasksForPlayer}
        isSelf={playerId === showTasksForPlayer}
        onClose={() => setShowTasksForPlayer(undefined)}
      />
    );
  }

  return (
    <MainGameScreen
      state={state}
      code={code}
      playerId={playerId}
      onPressPlayer={otherPlayerId => setShowTasksForPlayer(otherPlayerId)}
    />
  );
}

export default App;
