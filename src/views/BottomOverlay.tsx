'use client';

import React from 'react';
import styles from './bottomOverlay.module.css';

type BottomOverlayProps = {
  status: string;
  code: string;
  difficulty?: number;
  showNavigation?: boolean;
  onPressNavigation: () => void;
};
function BottomOverlay(props: BottomOverlayProps) {
  return (
    <div className={styles.bottomOverlay}>
      <div className={styles.statusContainer}>
        {props.status}
        {props.showNavigation && <span onClick={props.onPressNavigation}> ➤</span>}
      </div>
      <div className={styles.codeContainer}>
        {props.code}
        {props.difficulty !== undefined && ` (${props.difficulty})`}
      </div>
    </div>
  );
}

export default BottomOverlay;
