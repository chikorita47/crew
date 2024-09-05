import React from 'react';
import styles from './task.module.css';

type Props = {
  number: number;
  size?: number;
  stroke?: boolean;
};
// TODO: standardize the width of all number document dimensions

function NumberSymbol({ size, number, stroke = false }: Props) {
  const className = [styles.numberSymbol, stroke ? styles.valueNumber : ''].join(' ');
  return <img src={`images/${number}.svg`} height={size} className={className} />;
}

export default NumberSymbol;
