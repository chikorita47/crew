'use client'

import { useState, useEffect } from 'react';
import styles from './page.module.css'

import db from '../firebase';
import { ref, set, child, onValue } from "firebase/database";
import { playCard, giveHint, deal, createGame, joinGame, startGame, claimGoal, dealGoals, finalizeGoalsAndRuleset } from '../actions';
import { getStatusText, getCurrentTrick } from '../selectors';
import { GameState, ProvisionalGame } from '../types';

function resetState() {
  const gameRef = child(child(ref(db), 'games'), 'AAAA');
  set(gameRef, {
    players: [
      {
        id: 0,
        key: 'AAAA',
        name: 'Nathan',
        hand: [{ number: 9, suit: 'blue' }, { number: 7, suit: 'blue' }],
        hint: { used: true, card: { number: 9, suit: 'blue' }, placement: 'top' },
        goals: { 23: { id: 23, done: false }, 14: { id: 14, done: true } },
        isCaptain: true,
        isDealer: true,
        extraCards: 1,
      },
      {
        id: 1,
        key: 'BBBB',
        name: 'Eric',
        hand: [{ number: 9, suit: 'green' }, { number: 8, suit: 'green' }, { number: 7, suit: 'green' }],
        hint: { used: false },
        goals: {},
        isCaptain: false,
        isDealer: false,
        extraCards: 0,
      },
      {
        id: 2,
        key: 'CCCC',
        name: 'Melora',
        hand: [{ number: 9, suit: 'pink' }, { number: 7, suit: 'yellow' }],
        hint: { used: false },
        goals: {},
        isCaptain: false,
        isDealer: false,
        extraCards: 0,
      }
    ],
    tricks: [
      {
        winner: 0, // Nathan
        leader: 1,
        cards: [
          { number: 3, suit: 'green' },
          { number: 5, suit: 'green' },
          { number: 9, suit: 'blue' },
        ],
      },
      {
        winner: null,
        leader: 0,
        cards: [
          { number: 4, suit: 'pink' },
        ],
      },
    ],
  });
}


function Host() {
  const [code, setCode] = useState<string | undefined>();
  const [key, setKey] = useState<string | undefined>();

  const [state, setState] = useState<GameState>();
  useEffect(() => {
    if (code) {
      const gameRef = child(child(ref(db), 'games'), code);
      const cleanup = onValue(gameRef, snapshot => {
        setState(snapshot.val());
      });
      return cleanup;
    }
  }, [code]);

  return (
    <div>
      <div>Host: Eric</div>
      <div><a onClick={async () => {
        const { code, key } = await createGame('eric');
        setCode(code);
        setKey(key);
      }}>Create Game</a></div>
      <div>Code: {code}</div>
      <div>Key: {key}</div>

      <div><a onClick={async () => {
        if (!code) throw new Error('Cannot start game with no code');
        const state = await startGame(code);
        dealGoals(state, 10, code);
      }}>Start Game</a></div>
      <div>
        {state?.unassignedGoals && Object.values(state.unassignedGoals).map(goal => (
          <a onClick={() => claimGoal(state, 1, goal.id, code!!)}>{goal.id}:{goal.provisionalPlayerId} </a>
        ))}
      </div>
      <div><a onClick={() => finalizeGoalsAndRuleset(state!!, { hintMode: 'default' }, code!!)}>Begin Game</a></div>
    </div>
  )
}

function Player(props: any) {
  const [code, setCode] = useState<string>('');
  const [key, setKey] = useState<string | undefined>();

  return (
    <div>
      <div>Player: {props.name}</div>
      <input type='text' value={code} onChange={event => setCode(event.target.value)} />
      <div><a onClick={async () => {
        const key = await joinGame(props.name, code);
        setKey(key);
      }}>Join Game</a></div>
      <div>Key: {key}</div>
    </div>
  )
}

function Page() {
  return (
    <main className={styles.main}>
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <Host />
        <Player name='nathan' />
        <Player name='melora' />
      </div>
    </main>
  );
}

function Home() {
  const [state, setState] = useState<GameState>({ players: [] });

  useEffect(() => {
    // resetState();
    const gameRef = child(child(ref(db), 'games'), 'AAAA');
    const cleanup = onValue(gameRef, snapshot => {
      setState(snapshot.val());
    });
    return cleanup;
  });

  return (
    <main className={styles.main}>
      {state.players.length ? <><div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {state.players.map(player => {
          return <div>
            <div>{player.name} {player.isCaptain ? 'C' : null} {player.extraCards ? `+${player.extraCards}` : null}</div>
            <div>{player.hand ? player.hand.map((card, index) => (<a onClick={() => playCard(state, player.id, index)}>{card.number}{card.suit} </a>)) : null}</div>
            <div>Hint: {player.hint && player.hint.used ? `${player.hint.card!.number} ${player.hint.card!.suit} ${player.hint.placement}` : null}</div>
            <div>{getStatusText(state, player.id)}</div>
            <div><a onClick={() => deal(state, player.id)}>Deal</a></div>
          </div>;
        })}
      </div>
        <div>
          Current trick:
          {getCurrentTrick(state).cards?.map(card => (<a>{card.number}{card.suit} </a>))}
        </div></> : null}
    </main>
  )
}

export default Page;
