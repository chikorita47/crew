import React from 'react';
import NumberSymbol from './Number';
import styles from './task.module.css';

type Props = {
  value: number;
};

function ValueSymbol({ value }: Props) {
  const valueDigits = String(value).split('');
  return (
    <div className={[styles.valueSymbol, styles.number, styles.numberOutlined].join(' ')}>
      <div className={styles.valueNumberContainer}>
        {valueDigits.map((v, i) => (
          <NumberSymbol number={Number(v)} key={`digit-${v}_${i}`} stroke />
        ))}
      </div>
    </div>
  );
}

export default ValueSymbol;
