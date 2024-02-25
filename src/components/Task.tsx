import React from 'react';
import { Card, Comparison, IntRange, Suit, SuitNumber } from '@/types';
import SuitSymbol from './SuitSymbol';
import { makeCard } from '@/data/helpers';
import styles from './task.module.css';

const SUITS = [Suit.BLUE, Suit.GREEN, Suit.YELLOW, Suit.PINK];
/*
 * the different task arrangements are:
 * text - image
 * text - image -text
 * text only
 * two-by-two
 *
 *
 */
type TaskLayout = 'bottom-image' | 'inline-image' | 'no-image' | 'two-by-two';
type TaskProps = {
  layout: TaskLayout;
  content: { cards?: Card[] };
  subscript?: string;
  playerCount: number;
};

function Task(props: TaskProps) {
  const { subscript } = props;
  return (
    <div style={{ backgroundColor: 'gray', width: '100%', height: '100%' }}>
      <CardIconOld number={1} />
      <CardIconOld suit={Suit.BLACK} />
      <CardIconOld suit={Suit.GREEN} />
      <CardIcon suit={Suit.GREEN} />
      <CardIconOld number={4} suit={Suit.PINK} />
      <CardIconOld number={9} suit={Suit.YELLOW} />
      <CardIconOld number={1} suit={Suit.BLUE} />
      <CardIcon number={1} suit={Suit.BLUE} />
      <CardIcon number={1} suit={Suit.BLACK} />
      <CardIcon number={1} />
      <CardArrangement cards={[{ number: 1, suit: Suit.BLACK }]} />
      {/* Subscript Container */}
      {subscript ? <div className={styles.subscriptContainer}>{subscript}</div> : null}
    </div>
  );
}

export default Task;

type TaskImageProps = {
  type: 'cards' | 'players' | 'captain' | 'value';
  cards?: CardShorthand[];
  cardsLayout?;
  playersImage?: Comparison;
  value?: number;
};
function TaskImage(props) {}
function TaskText(props) {}
function CardBorder(props) {}

export function CardIconBase({ children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={styles.cardBorder}>
      <div className={styles.cardContent}>
        {/* <CardIconBackground background={Suit.GREEN} /> */}
        <div className={styles.cardIconBackground} />
        {children}
      </div>
    </div>
  );
}
type CardIconBackgroundProps = {
  background: Suit | 'task' | 'all-suits';
};
function CardIconBackground(props: CardIconBackgroundProps) {
  return <div className={styles.cardIconBackground} />;
}
export function TaskCard(props: TaskProps) {
  return (
    <CardIconBase>
      <div className={styles.taskCard}></div>
    </CardIconBase>
  );
}
function getSuitColor(suit: Suit) {
  switch (suit) {
    case Suit.BLACK:
      return ['rgba(0,0,0)', 'rgba(0,0,0)', 'rgba(0,0,0)'];
    case Suit.BLUE:
      return ['rgba(0,91,179,1)', 'rgba(3,127,245,1)', 'rgba(0,183,255,1)'];
    case Suit.GREEN:
      return ['rgba(114,163,0,1)', 'rgba(145,207,0,1)', 'rgba(158,226,0,1)'];
    case Suit.PINK:
      return ['rgba(212,110,142,1)', 'rgba(255,139,175,1)', 'rgba(255,133,171,1)'];
    case Suit.YELLOW:
      return ['rgba(201,170,0,1)', 'rgba(255,207,0,1)', 'rgba(255,224,0,1)'];
    default:
      throw new Error('Non-Suit value passed to getSuitColor');
  }
}
function CardIcon(props: CardIconProps) {
  const { number, suit } = props;
  const backgroundStyles = [styles.cardIcon, suit ? styles[`cardIcon-${suit}`] : styles['cardIcon-all']].join(' ');
  return (
    <CardIconBase>
      <div className={backgroundStyles}>
        {/* <div className={styles.cardIconContent}> */}
        {/* Number */}
        {number ? <span>{number}</span> : null}
        {/* Suit Symbol */}
        {suit ? <SuitSymbol suit={suit} /> : null}
        {/* </div> */}
      </div>
    </CardIconBase>
  );
}

type CardIconProps = { quantity?: number; number?: number; suit?: Suit; topText?: string };
function CardIconOld({
  number,
  suit,
  quantity, // actually dont include quantity and toptext in this component but
  topText, // put it in the arrangement component instead?
}: CardIconProps) {
  if (!number && !suit) throw new Error('Card is missing properties - must have either number or suit');
  const containerStyle: React.CSSProperties = {
    height: 120,
    width: 80,
    borderRadius: 5,
    backgroundColor: 'white',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1,
  };

  const Background = () => {
    // const backgroundStyle: React.CSSProperties = {
    //   background: `linear-gradient(5deg, ${a} 0%, ${b} 15%, ${c} 100%)`,
    //   // height: '100%',
    //   // width: '100%',
    // };
    const suits = suit ? [suit] : SUITS;
    const size = suits.length === 1 ? '100%' : '50%';
    return (
      <div
        // background container (border)
        style={{
          padding: 5,
          display: 'flex',
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          zIndex: 2,
          position: 'absolute',
        }}>
        <div
          //
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            borderRadius: 3,
            // position: 'absolute',
          }}>
          {suits.map(s => {
            const [a, b, c] = getSuitColor(s);
            const backgroundStyle: React.CSSProperties = {
              // background:
              // 'linear-gradient(10deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 20%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.5) 100%)',
              background: `linear-gradient(10deg, ${a} 0%, ${b} 30%, ${c} 100%)`,
              flex: '1 0 50%',
              flexWrap: 'wrap',
              maxWidth: size,
              maxHeight: size,
            };
            return <div key={s} style={backgroundStyle} />;
          })}
        </div>
      </div>
    );
  };
  const contentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    color: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: 'xx-large',
  };
  // const suitSymbol =
  return (
    <div style={containerStyle}>
      <Background />
      <div
        style={{
          zIndex: 10,
          position: 'relative',
          display: 'flex',
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 15,
        }}>
        <div style={contentStyle}>
          {/* Number */}
          {number ? <span>{number}</span> : null}
          {/* Suit Symbol */}
          {suit ? <SuitSymbol suit={suit} /> : null}
        </div>
      </div>
    </div>
  );
}

// type TArrangement<T extends number> = T extends 1
//   ? 'only'
//   : T extends 2
//     ? 'side-by-side' | 'big-small' | 'fan'
//     : T extends 3
//       ? 'fan'
//       : 'fan' | 'grid';
/*
 
Components:
- quantity tag (win 3x subs)
- quantity text span (I will win *3* tricks) (the number/X is bigger/bolder than the other text)
- trick value tag (trick total value of 22 or 23)
- subtext
- Card
  - Support single color for any of the 5 suits, or wild (4 colors) with a number
- Card of 
- Captain icon
- players icon


Arrangements:
- double card
  - size differences (e.g. win more pink than green)
  - Side by side
  - fan

- triple
- quad
  - in a fan, or 2x2



 */
type CardArrangementType = 'fan' | 'cluster' | 'side-by-side' | 'size-compare';
type CardArrangementProps = {
  cards: Array<Partial<Card>>;
  type: CardArrangementType;
  quantityTag?: number;
  topText?: Array<[number, string]>;
};

function CardArrangement({ cards, type, quantityTag, topText }: CardArrangementProps) {
  return (
    <div style={getArrangementStyle(cards.length, type)}>
      {cards.map(card => {
        return (
          <CardIconOld key={`${card.suit || 'all'}-${card.number || 'any'}`} suit={card.suit} number={card.number} />
        );
      })}
    </div>
  );
}

function getArrangementStyle(cards: number, type: CardArrangementType): React.CSSProperties {
  // returns the style of the Arrangement container based on the number of cards in the arrangement,
  // and the type of arrangement
  if (cards === 1) return {};
  if (type === 'side-by-side') return {};
  return {};
}

//
// Optional API for shorthand creation of cards
//

function getSuitFromShorthand<const S extends SuitLetter>(s: S) {
  if (s === 'B') return Suit.BLUE as const;
  if (s === 'G') return Suit.GREEN as const;
  if (s === 'P') return Suit.PINK as const;
  if (s === 'Y') return Suit.YELLOW as const;
  if (s === 'S') return Suit.BLACK as const;
  throw new Error('Improper card shorthand provided:', s);
}
export function parseCardShorthand<const T extends CardShorthand>(shorthand: T) {
  const suitLetter = shorthand[0] as FirstChar<T>;
  const number = shorthand[1] as SecondChar<T>;
  const suit = getSuitFromShorthand(suitLetter) as SuitMap<typeof suitLetter>;
  return { suit, number };
}

type ColorSuitLetter = 'B' | 'G' | 'P' | 'Y';
type SuitLetter = ColorSuitLetter | 'S';
export type CardShorthand = `${ColorSuitLetter}${IntRange<1, 10>}` | `S${IntRange<1, 5>}`;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type FirstChar<T extends CardShorthand> = T extends `${infer first}${infer _rest}` ? first : never;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type SecondChar<T extends CardShorthand> = T extends `${infer _first}${infer second}${infer _rest}` ? second : never;
type SuitMap<S extends SuitLetter> = S extends 'B'
  ? Suit.BLUE
  : S extends 'G'
    ? Suit.GREEN
    : S extends 'P'
      ? Suit.PINK
      : S extends 'S'
        ? Suit.BLACK
        : S extends 'Y'
          ? Suit.YELLOW
          : never;
