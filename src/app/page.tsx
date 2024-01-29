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
import UndoHandler from '../UndoHandler';
import ResetGameScreen from '@/screens/ResetGameScreen';

function App() {
  const [code, setCode] = useState<string | undefined>();
  const [key, setKey] = useState<string | undefined>();
  const [playerId, setPlayerId] = useState<number | undefined>();
  const [showTasksForPlayer, setShowTasksForPlayer] = useState<number | undefined>();
  const [showResetGameScreen, setShowResetGameScreen] = useState<boolean>(false);

  let initialOrientation = 'portrait-primary';
  if (typeof screen !== 'undefined' && !!screen.orientation) {
    initialOrientation = screen.orientation.type;
  }
  const [orientation, setOrientation] = useState(initialOrientation);
  useEffect(() => {
    if (typeof screen !== 'undefined' && !!screen.orientation) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleOrientationChange = (event: any) => {
        if (event.target) {
          setOrientation(event.target.type);
        }
      };
      screen.orientation.addEventListener('change', handleOrientationChange);
      return () => screen.orientation.removeEventListener('change', handleOrientationChange);
    }
  }, []);

  const [state, setState] = useState<GameState | ProvisionalGame>();
  useEffect(() => {
    if (code) {
      const gameRef = child(child(ref(db), 'games'), code);
      const cleanup = onValue(gameRef, snapshot => {
        const newState = snapshot.val();
        setState(newState);
        UndoHandler.save(newState);
      });
      return cleanup;
    }
  }, [code]);

  if (orientation.startsWith('landscape')) {
    return <div className="center-container">Please rotate your device into portrait mode!</div>;
  }

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

  if (!state) {
    return <div className="center-container">Entering game...</div>;
  }

  if ('host' in state) {
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
    return <div className="center-container">Re-entering game...</div>;
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

  if (showResetGameScreen) {
    return (
      <ResetGameScreen
        state={state}
        code={code}
        playerId={playerId}
        onStartGame={newState => {
          setState(newState);
          setShowResetGameScreen(false);
        }}
        onPressBack={() => setShowResetGameScreen(false)}
      />
    );
  }

  return (
    <MainGameScreen
      state={state}
      code={code}
      playerId={playerId}
      onPressPlayer={otherPlayerId => setShowTasksForPlayer(otherPlayerId)}
      onPressGameFinished={() => setShowResetGameScreen(true)}
    />
  );
}

export default App;
