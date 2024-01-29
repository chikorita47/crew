'use client';

import React, { useState } from 'react';
import * as Actions from '../actions';
import Button from '../components/Button';
import styles from './game.module.css';
import { GameState } from '../types';
import * as Selectors from '../selectors';
import UndoHandler from '../UndoHandler';
import BottomOverlay from '../views/BottomOverlay';
import OtherPlayersView from '../views/OtherPlayersView';
import TrickView from '../views/TrickView';
import SelfView from '../views/SelfView';
import HandView from '../views/HandView';

function getOtherPlayersOrder(playerId: number, numberOfPlayers: number): number[] {
  const order: number[] = [];
  for (let i = (playerId + 1) % numberOfPlayers; i !== playerId; i = (i + 1) % numberOfPlayers) {
    order.push(i);
  }
  return order;
}

type MainGameScreenProps = {
  state: GameState;
  code: string;
  playerId: number;
  onPressPlayer: (playerId: number) => void;
  onPressGameFinished: () => void;
};
function MainGameScreen({ state, code, playerId, onPressPlayer, onPressGameFinished }: MainGameScreenProps) {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | undefined>();
  const player = Selectors.getPlayer(state, playerId);
  const isHost = Selectors.getIsPlayerHost(state, playerId);
  const hand = Selectors.getPlayerHand(state, playerId);
  const nextPlayerId = Selectors.getNextPlayerId(state);
  const numberOfPlayers = Selectors.getNumberOfPlayers(state);
  const otherPlayers = Selectors.getPlayers(state);
  const otherPlayersInOrder = getOtherPlayersOrder(playerId, numberOfPlayers).map(id => otherPlayers[id]);
  const tricksWon = Selectors.getPlayersTricksWon(state);
  const hintMode = Selectors.getHintMode(state);

  const undo = () => {
    const prevState = UndoHandler.undo();
    if (prevState) Actions.updateState(prevState, code);
  };

  const isAnyCardSelected = selectedCardIndex || selectedCardIndex === 0;
  const isSelectedCardLegalToPlay =
    isAnyCardSelected && Selectors.getIsCardLegalToPlay(state, playerId, selectedCardIndex);
  const canGiveHint = isAnyCardSelected && Selectors.getCanPlayerGiveHint(state, playerId);
  const hintPlacement = canGiveHint && Selectors.getHintPlacementForCard(state, playerId, selectedCardIndex);

  const isGameFinished = Selectors.getIsGameFinished(state);
  const onSelectCard = isGameFinished ? undefined : (index?: number) => setSelectedCardIndex(index);
  return (
    <div className={styles.gameContainer}>
      <div className={styles.upperGameContainer}>
        <OtherPlayersView
          players={otherPlayersInOrder}
          tricksWonByPlayers={tricksWon}
          hintMode={hintMode}
          onPressPlayer={onPressPlayer}
        />
      </div>
      <div className={styles.trickContainer}>
        <TrickView trick={Selectors.getCurrentTrick(state)} numberOfPlayers={numberOfPlayers} playerId={playerId} />
      </div>
      <div className={styles.lowerGameContainer}>
        <SelfView
          player={player}
          tricksWon={tricksWon[playerId]}
          hintMode={hintMode}
          onPress={() => onPressPlayer(playerId)}
          onPressUndo={isHost ? undo : undefined}
        />
        <HandView hand={hand} selectedCardIndex={selectedCardIndex} onSelectCard={onSelectCard} />
        <BottomOverlay
          status={Selectors.getStatusText(state, playerId)}
          code={code}
          difficulty={Selectors.getDifficulty(state)}
          showNavigation={isHost && isGameFinished}
          onPressNavigation={onPressGameFinished}
        />
      </div>
      {isAnyCardSelected && (
        <div className={styles.textButtonContainer}>
          <Button
            text="PLAY"
            disabled={nextPlayerId !== playerId || !isSelectedCardLegalToPlay}
            onPress={() => {
              if (!isAnyCardSelected) {
                throw new Error('Clicked Play Card when no card was selected');
              }
              const index = selectedCardIndex;
              setSelectedCardIndex(undefined);
              Actions.updateState(Actions.playCard(state, playerId, index), code);
            }}
            big
          />
          {canGiveHint && !!hintPlacement && (
            <Button
              text="HINT"
              onPress={() => {
                if (!isAnyCardSelected) {
                  throw new Error('Clicked Place Hint when no card was selected');
                }
                if (!hintPlacement) {
                  throw new Error('Cannot give this hint right now');
                }
                const index = selectedCardIndex;
                setSelectedCardIndex(undefined);
                Actions.updateState(Actions.giveHint(state, playerId, index, hintPlacement), code);
              }}
              big
            />
          )}
        </div>
      )}
      {selectedCardIndex !== undefined && selectedCardIndex !== 0 && (
        <div className={styles.leftButton} onClick={() => setSelectedCardIndex(selectedCardIndex - 1)}>
          ⟨
        </div>
      )}
      {selectedCardIndex !== undefined && selectedCardIndex + 1 !== hand.length && (
        <div className={styles.rightButton} onClick={() => setSelectedCardIndex(selectedCardIndex + 1)}>
          ⟩
        </div>
      )}
    </div>
  );
}

export default MainGameScreen;
