import type { Metadata } from 'next';
import React from 'react';
import './globals.css';
import { firaSans } from '../fonts';

export const metadata: Metadata = {
  title: 'Crew',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={firaSans.className}>{children}</body>
    </html>
  );
}
