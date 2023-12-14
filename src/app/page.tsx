'use client'

import { useState, useEffect } from 'react';
import styles from './page.module.css'

import TextGameScreen from '../screens/TextGame';

function App() {
  return (
    <main className={styles.main}>
      <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
        <TextGameScreen />
      </div>
    </main>
  );
}

export default App;
