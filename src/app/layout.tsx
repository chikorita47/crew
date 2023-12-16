import type { Metadata } from 'next';
// import { Roboto } from 'next/font/google';
import localFont from 'next/font/local';
import React from 'react';
import './globals.css';

// const roboto = Roboto({ subsets: ['latin'], weight: '400' });
const firaSans = localFont({
  src: [
    { path: '../fonts/FiraSans-Regular.ttf', weight: '400' },
    { path: '../fonts/FiraSans-Bold.ttf', weight: '700' },
  ],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Crew 2',
  description: 'MMREN family game',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={firaSans.className}>{children}</body>
    </html>
  );
}
