import React from 'react';
import styles from './task.module.css';

type Props = {
  quantity: number;
};
function QuantityTagIcon({ quantity }: Props) {
  return <div className={styles.quantityTag}>{quantity}</div>;
}

export default QuantityTagIcon;
