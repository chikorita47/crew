'use client';

import { child, onValue, ref } from 'firebase/database';
import React, { useState, useEffect } from 'react';

import * as Actions from '../actions';
import { TASKS_DATA } from '../data';
import db from '../firebase';
import * as Selectors from '../selectors';
import { GameState, Player, ProvisionalGame, Ruleset, RulesetHintMode, TaskData } from '../types';

type EnterGameViewProps = {
  onEnterGame: (code: string, key: string) => void;
};
function EnterGameView(props: EnterGameViewProps) {
  const [name, setName] = useState<string | undefined>();
  const [code, setCode] = useState<string | undefined>();

  return (
    <>
      <input type="text" value={name} placeholder="Name" onChange={event => setName(event.target.value)} />
      <input type="text" value={code} placeholder="Code" onChange={event => setCode(event.target.value)} />
      <div>
        <input
          type="button"
          onClick={async () => {
            if (!name) {
              throw new Error('Must enter name');
            }
            const { code, key } = await Actions.createGame(name);
            props.onEnterGame(code, key);
          }}
          value="Create New Game"
          disabled={!name}
        />
      </div>
      <div>
        <input
          type="button"
          onClick={async () => {
            if (!name || !code) {
              throw new Error('Must enter name and code');
            }
            const key = await Actions.joinGame(name, code);
            props.onEnterGame(code, key);
          }}
          value="Join Game"
          disabled={!name || !code}
        />
      </div>
    </>
  );
}

type SetupGameViewProps = {
  state: ProvisionalGame;
  code: string;
  playerKey: string;
  onStartGame: (state: GameState) => void;
};
function SetupGameView(props: SetupGameViewProps) {
  const [difficulty, setDifficulty] = useState<number | undefined>();
  const [dealer, setDealer] = useState<string>(props.playerKey);
  const isHost = props.state.host === props.state.clientList[props.playerKey];

  if (!isHost) {
    return <div>Waiting for {props.state.host} to start the game...</div>;
  }

  const numberOfPlayers = Object.keys(props.state.clientList).length;
  const canStart = numberOfPlayers >= 3 && numberOfPlayers <= 5;
  return (
    <>
      <div>Code: {props.code}</div>
      <div>Players:</div>
      {Object.entries(props.state.clientList).map(([key, playerName]) => (
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
      <input
        type="button"
        onClick={async () => {
          if (!difficulty) {
            throw new Error('Must enter valid difficulty');
          }
          const initialState = await Actions.startGame(props.code);
          const dealerId = Selectors.getPlayerByKey(initialState, dealer).id;
          const stateWithDealFinished = Actions.dealPlayerHands(Actions.dealTasks(initialState, difficulty), dealerId);
          Actions.updateState(stateWithDealFinished, props.code);
          props.onStartGame(stateWithDealFinished);
        }}
        value="Start Game"
        disabled={!canStart || !difficulty}
      />
    </>
  );
}

type XTricksSelectorViewProps = {
  onSubmit: (value: number) => void;
  data?: TaskData;
};
function XTricksSelectorView(props: XTricksSelectorViewProps) {
  const [value, setValue] = useState<number | undefined>();
  if (props.data) {
    return <span>{props.data.n}</span>;
  }
  return (
    <>
      <input
        type="number"
        value={value}
        placeholder="Difficulty"
        min={1}
        max={100}
        onChange={event => setValue(~~event.target.value)}
      />
      <input
        type="button"
        value="Submit"
        disabled={value === undefined}
        onClick={() => {
          if (value === undefined) throw new Error('Must enter a value for X tricks');
          props.onSubmit(value);
        }}
      />
    </>
  );
}

type AssignTasksViewProps = {
  state: GameState;
  code: string;
  playerId: number;
  onFinalizeTasks: (state: GameState) => void;
};
function AssignTasksView(props: AssignTasksViewProps) {
  const isHost = Selectors.getIsPlayerHost(props.state, props.playerId);
  const [hintMode, setHintMode] = useState<RulesetHintMode>('default');
  const [timeInSeconds, setTimeInSeconds] = useState<number | undefined>();

  if (!props.state.unassignedTasks) {
    throw new Error('Should not be rendering AssignTasksView when there are no unassigned tasks');
  }

  const difficultyIndex = Selectors.getNumberOfPlayers(props.state) - 3;
  const playerHand = Selectors.getPlayerHand(props.state, props.playerId);
  const ruleset: Ruleset = { hintMode };
  if (timeInSeconds) {
    ruleset.timeInSeconds = timeInSeconds;
  }
  return (
    <>
      <div>Tasks:</div>
      {props.state.unassignedTasks.order.map(taskId => {
        const task = props.state.unassignedTasks!.tasks[taskId];
        const taskData = TASKS_DATA[taskId];
        const shouldShowXTricksSelector =
          taskData.requiresExtraData &&
          (props.playerId === task.provisionalPlayerId || (task.id === 95 && 'data' in task));
        return (
          <div key={`task-${task.id}`}>
            <a
              onClick={() =>
                Actions.updateState(Actions.toggleClaimTask(props.state, props.playerId, task.id), props.code)
              }>
              {taskData.difficulty[difficultyIndex]}: {taskData.text}
              {taskData.subtext && `/${taskData.subtext}`}
              {'provisionalPlayerId' in task && ` (${Selectors.getPlayerName(props.state, task.provisionalPlayerId!)})`}
            </a>
            {shouldShowXTricksSelector && (
              <XTricksSelectorView
                data={task.data}
                onSubmit={value => {
                  Actions.updateState(
                    Actions.addDataToTask(props.state, props.playerId, task.id, { n: value }),
                    props.code,
                  );
                }}
              />
            )}
            {isHost && (
              <input
                type="button"
                value="Kick Task"
                onClick={() => Actions.updateState(Actions.kickTask(props.state, task.id), props.code)}
              />
            )}
          </div>
        );
      })}
      {isHost && (
        <>
          <input
            type="button"
            onClick={() =>
              Actions.updateState(Actions.dealPlayerHands(props.state, Selectors.getDealerId(props.state)), props.code)
            }
            value="Re-deal"
          />
          <div>Ruleset:</div>
          <div>
            Hints:
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
          <input
            type="number"
            value={timeInSeconds}
            placeholder="Timer Length (seconds)"
            min={0}
            max={300}
            onChange={event => setTimeInSeconds(~~event.target.value)}
          />
          <input
            type="button"
            onClick={() => {
              const newState = Actions.finalizeTasksAndRuleset(props.state, ruleset);
              Actions.updateState(newState, props.code);
              props.onFinalizeTasks(newState);
            }}
            value="Start Game"
            disabled={!Selectors.getAreAllTasksAssigned(props.state)}
          />
        </>
      )}
      <div>Your Hand:</div>
      {playerHand.map((card, index) => (
        <div key={`hand-${index}`}>
          {card.number} {card.suit}
        </div>
      ))}
    </>
  );
}

function getHintString(player: Player, hintMode: RulesetHintMode): string | null {
  if (player.hint && player.hint.used) {
    const placementString = {
      top: 'highest',
      middle: 'only',
      bottom: 'lowest',
    };
    if (player.hint.card && player.hint.placement) {
      if (hintMode === 'noTokens') {
        return `${player.hint.card.number} ${player.hint.card.suit} (no token)`;
      }
      return `${player.hint.card.number} is my ${placementString[player.hint.placement]} ${player.hint.card.suit}`;
    }
    return 'already used';
  }
  return null;
}

type OtherPlayerViewProps = {
  data: Player;
  tricksWon: number;
  hintMode: RulesetHintMode;
};
function OtherPlayerView(props: OtherPlayerViewProps) {
  const hintString = getHintString(props.data, props.hintMode);
  return (
    <>
      <div>{props.data.name}:</div>
      {props.data.isCaptain && <div>is the captain</div>}
      {!!props.data.extraCards && <div>has the extra card</div>}
      <div>has won {props.tricksWon} tricks.</div>
      {hintString && <div>Their Hint: {hintString}</div>}
      {props.data.tasks && (
        <>
          <div>Their Tasks:</div>
          {Object.values(props.data.tasks).map(task => {
            const taskData = TASKS_DATA[task.id];
            return (
              <div key={`task-${task.id}`} style={task.done ? { textDecoration: 'line-through' } : {}}>
                {taskData.text}
                {taskData.subtext && `/${taskData.subtext}`}
                {task.id === 95 && ` (${task.data!.n})`}
              </div>
            );
          })}
        </>
      )}
    </>
  );
}

type GameViewProps = {
  state: GameState;
  code: string;
  playerId: number;
};
function GameView(props: GameViewProps) {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | undefined>();
  const player = Selectors.getPlayer(props.state, props.playerId);
  const nextPlayerId = Selectors.getNextPlayerId(props.state);
  const currentTrick = Selectors.getCurrentTrick(props.state);
  const isBetweenTricks = Selectors.getIsBetweenTricks(props.state);
  const numberOfPlayers = Selectors.getNumberOfPlayers(props.state);

  const hintString = getHintString(player, Selectors.getHintMode(props.state));

  const isAnyCardSelected = selectedCardIndex || selectedCardIndex === 0;
  const isSelectedCardLegalToPlay =
    isAnyCardSelected && Selectors.getIsCardLegalToPlay(props.state, props.playerId, selectedCardIndex);
  return (
    <>
      <div>Status: {Selectors.getStatusText(props.state, props.playerId)}</div>
      <div>Current Trick:</div>
      {currentTrick.cards &&
        currentTrick.cards.map((card, index) => (
          <div key={`trick-${index}`}>
            {Selectors.getPlayerName(props.state, (currentTrick.leader + index) % numberOfPlayers)}: {card.number}{' '}
            {card.suit}
          </div>
        ))}
      {player.isCaptain && <div>You are the captain</div>}
      {!!player.extraCards && <div>You have the extra card</div>}
      {hintString && <div>Your Hint: {hintString}</div>}
      <div>You have won {Selectors.getPlayerTricksWon(props.state, props.playerId)} tricks.</div>
      <div>Your Hand:</div>
      {player.hand &&
        Object.values(player.hand).map((card, index) => (
          <div key={`hand-${index}`} onClick={() => setSelectedCardIndex(index)}>
            {card.number} {card.suit}
            {index === selectedCardIndex && ' *'}
          </div>
        ))}
      {player.tasks && (
        <>
          <div>Your Tasks:</div>
          {Object.values(player.tasks).map(task => {
            const taskData = TASKS_DATA[task.id];
            return (
              <div
                key={`task-${task.id}`}
                style={task.done ? { textDecoration: 'line-through' } : {}}
                onClick={() =>
                  Actions.updateState(Actions.toggleTaskDone(props.state, props.playerId, task.id), props.code)
                }>
                {taskData.text}
                {taskData.subtext && `/${taskData.subtext}`}
                {task.data && ` (${task.data.n})`}
              </div>
            );
          })}
        </>
      )}
      <input
        type="button"
        onClick={() => {
          if (!isAnyCardSelected) {
            throw new Error('Clicked Play Card when no card was selected');
          }
          const index = selectedCardIndex;
          setSelectedCardIndex(undefined);
          Actions.updateState(Actions.playCard(props.state, props.playerId, index), props.code);
        }}
        value="Play Card"
        disabled={nextPlayerId !== props.playerId || !isSelectedCardLegalToPlay}
      />
      <input
        type="button"
        onClick={() => {
          if (!isAnyCardSelected) {
            throw new Error('Clicked Place Hint when no card was selected');
          }
          const index = selectedCardIndex;
          setSelectedCardIndex(undefined);
          Actions.updateState(Actions.giveHint(props.state, props.playerId, index), props.code);
        }}
        value="Place Hint"
        disabled={
          !isBetweenTricks || player.hint?.used || !isAnyCardSelected || Selectors.getAreAllHintsUsed(props.state)
        }
      />
      {Selectors.getOtherPlayers(props.state, props.playerId).map(otherPlayer => (
        <OtherPlayerView
          key={`other-player-${otherPlayer.id}`}
          data={otherPlayer}
          tricksWon={Selectors.getPlayerTricksWon(props.state, otherPlayer.id)}
          hintMode={Selectors.getHintMode(props.state)}
        />
      ))}
    </>
  );
}

function TextGameScreen() {
  const [code, setCode] = useState<string | undefined>();
  const [key, setKey] = useState<string | undefined>();
  const [playerId, setPlayerId] = useState<number | undefined>();

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
      <div>
        <EnterGameView
          onEnterGame={(code, key) => {
            setCode(code);
            setKey(key);
          }}
        />
      </div>
    );
  }

  if (!state) {
    return <div>Entering game...</div>;
  }

  if ('host' in state) {
    return (
      <div>
        <SetupGameView
          state={state}
          code={code}
          playerKey={key}
          onStartGame={newState => {
            setPlayerId(Selectors.getPlayerByKey(newState, key).id);
            setState(newState);
          }}
        />
      </div>
    );
  }

  if (playerId === undefined) {
    setPlayerId(Selectors.getPlayerByKey(state, key).id);
    return <div>Re-entering game...</div>;
  }

  if (Selectors.getUnassignedTasksExist(state)) {
    return (
      <div>
        <AssignTasksView
          state={state}
          code={code}
          playerId={playerId}
          onFinalizeTasks={newState => {
            setState(newState);
          }}
        />
      </div>
    );
  }

  if (Selectors.getIsGameFinished(state)) {
    return <div>{Selectors.getStatusText(state, playerId)}</div>;
  }

  return (
    <div>
      <GameView state={state} code={code} playerId={playerId} />
    </div>
  );
}

export default TextGameScreen;
