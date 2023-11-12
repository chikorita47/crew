'use client'

import { useState, useEffect } from 'react';
import styles from './page.module.css'

import db from '../firebase';
import { ref, set, child, onValue } from "firebase/database";
import { playCard, giveHint, deal } from '../actions';
import { getStatusText, getCurrentTrick } from '../selectors';
import { GameState } from '../types';

function resetState() {
  const gameRef = child(child(ref(db), 'games'), 'AAAA');
  set(gameRef, {
    players: [
      {
        id: 0, // should match array index
        name: 'Nathan',
        hand: [{ number: 9, suit: 'blue' }, { number: 7, suit: 'blue' }],
        hint: { used: true, card: { number: 9, suit: 'blue' }, placement: 'top' },
        goals: [{ id: 23, done: false }, { id: 14, done: true }],
        isCaptain: true,
        isDealer: true,
        extraCards: 1,
      },
      {
        id: 1, // should match array index
        name: 'Eric',
        hand: [{ number: 9, suit: 'green' }, { number: 8, suit: 'green' }, { number: 7, suit: 'green' }],
        hint: { used: false },
        goals: [],
        isCaptain: false,
        isDealer: false,
        extraCards: 0,
      },
      {
        id: 2, // should match array index
        name: 'Melora',
        hand: [{ number: 9, suit: 'pink' }, { number: 7, suit: 'yellow' }],
        hint: { used: false },
        goals: [],
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
    unassignedGoals: [],
  });
}


export default function Home() {
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
