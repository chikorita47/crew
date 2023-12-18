'use client';

import React from 'react';
import styles from './modal.module.css';

type ModalProps = {
  children: React.ReactNode;
};
function Modal(props: ModalProps) {
  return (
    <div className={styles.container}>
      <div className={styles.modal}>{props.children}</div>
    </div>
  );
}

export default Modal;
