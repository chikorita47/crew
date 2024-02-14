'use client';

import React from 'react';
import styles from './button.module.css';

type ButtonProps = {
  text: string;
  big?: boolean;
  disabled?: boolean;
  onPress: () => void;
};
function Button(props: ButtonProps) {
  return (
    <div
      className={[styles.button, props.disabled ? styles.disabled : null, props.big ? styles.big : null]
        .filter(v => v)
        .join(' ')}
      onClick={props.disabled ? undefined : props.onPress ?? undefined}>
      {props.text}
    </div>
  );
}

export default Button;
