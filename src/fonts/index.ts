import localFont from 'next/font/local';

export const cityMedium = localFont({ src: '../fonts/City Medium.ttf', display: 'swap' });
export const firaSans = localFont({
  src: [
    { path: '../fonts/FiraSans-Regular.ttf', weight: '400' },
    { path: '../fonts/FiraSans-Bold.ttf', weight: '700' },
  ],
  display: 'swap',
});
