import React from 'react';
import SuitSymbol from './SuitSymbol';
import { Card, Comparison, Suit, TasksDataEntry } from '@/types';
import type { CardShorthand, SuitLetter } from '@/data/shorthandParser';
import styles from './task.module.css';
import parse from '@/data/shorthandParser';
import ValueSymbol from './ValueSymbol';

import { cityMedium } from '@/fonts';
import NumberSymbol from './Number';

// const SUITS = [Suit.BLUE, Suit.GREEN, Suit.YELLOW, Suit.PINK];
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
// type TaskProps = {
//   layout: TaskLayout;
//   content: { cards?: Card[] };
//   subscript?: string;
//   playerCount: number;
// } & React.HTMLAttributes<HTMLDivElement>;

type TaskProps = TasksDataEntry & { playerCount?: number };
function Task({ layout, text, subtext }: TaskProps) {
  if (!layout) return <></>;
  const subscript = subtext;
  const { cards, type, playerComparison, value, cardLayout = 'fan' } = layout;
  const Image = () =>
    cards ? (
      <CardArrangement type={cardLayout} cards={parse(cards)} />
    ) : playerComparison ? (
      <SuitSymbol suit={Suit.BLUE} />
    ) : value ? (
      <ValueSymbol value={value} />
    ) : (
      <></>
    );
  return (
    <CardIconBase>
      <div className={styles.taskCardContainer}>
        <div className={styles.taskCardContent}>
          {type === 'bottom-image' ? (
            <>
              {/* Text */}
              <div className={styles.taskTextContainer}>{parseTaskText(text, type)}</div>
              {/* Image  */}
              <Image />
              {/* Subscript */}
              {subscript ? <div className={styles.subscriptContainer}>{subscript}</div> : null}
            </>
          ) : type === 'inline-image' ? (
            <></>
          ) : type === 'two-by-two' ? (
            <></>
          ) : (
            <div className={styles.taskTextContainer}>{parseTaskText(text, type)}</div>
          )}
        </div>
      </div>
    </CardIconBase>
  );
  // const { subscript } = props;
  // return (
  //   <div style={{ backgroundColor: 'gray', width: '100%', height: '100%' }}>
  //     {/* <CardIcon number={1} />
  //     <CardIcon suit={Suit.BLACK} />
  //     <CardIcon suit={Suit.GREEN} />
  //     <CardIcon number={4} suit={Suit.PINK} />
  //     <CardIcon number={9} suit={Suit.YELLOW} />
  //     <CardIcon number={7} suit={Suit.BLUE} />
  //     <CardIcon number={3} suit={Suit.BLACK} />
  //     <CardIcon number={6} /> */}
  //     <CardArrangement cards={[{ number: 1, suit: Suit.BLACK }]} />
  //     {taskRenderer(tasks[11])}
  //     {taskRenderer(tasks[15])}
  //     {/* Subscript Container */}
  //     {subscript ? <div className={styles.subscriptContainer}>{subscript}</div> : null}
  //   </div>
  // );
}

export default Task;

type TaskImageProps = {
  type: 'cards' | 'players' | 'captain' | 'value';
  cards?: [CardArrangementType, CardShorthand[]];
  playersImage?: Comparison;
  value?: number;
};
// function TaskImage(props) {}
// function TaskText(props) {}

export function CardIconBase({ children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardBorder}>
        <div className={styles.cardContent}>
          <div className={styles.cardIconBackground} />
          {children}
        </div>
      </div>
    </div>
  );
}

type CardIconProps = { quantity?: number; number?: number; suit?: Suit; topText?: string };
function CardIcon(props: CardIconProps) {
  const { number, suit } = props;
  const backgroundStyles = [styles.cardIcon, suit ? styles[`cardIcon-${suit}`] : styles['cardIcon-all']].join(' ');
  return (
    <CardIconBase>
      <div className={backgroundStyles}>
        {/* <div className={styles.cardIconContent}> */}
        {/* Number */}
        {number ? <NumberSymbol number={number} /> : null}
        {/* {number ? <span className={[styles.number, cityMedium.className].join(' ')}>{number}</span> : null} */}
        {/* Suit Symbol */}
        {suit ? <SuitSymbol suit={suit} /> : null}
        {/* </div> */}
      </div>
    </CardIconBase>
  );
}
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
type CardArrangementType = 'fan' | 'cluster' | 'side-by-side' | 'big-small';
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
        return <CardIcon key={`${card.suit || 'all'}-${card.number || 'any'}`} suit={card.suit} number={card.number} />;
      })}
    </div>
  );
}

function getArrangementStyle(cards: number, type: CardArrangementType): React.CSSProperties {
  // returns the style of the Arrangement container based on the number of cards in the arrangement,
  // and the type of arrangement
  if (cards === 1) return {};
  if (cards >= 2) return { flexDirection: 'row', display: 'flex' };
  if (type === 'side-by-side') return {};
  return {};
}

type TaskStuff = {
  layout: TaskLayout;
  text: string;
  subscriptText?: string;
  cards?: Array<CardShorthand | number | SuitLetter>;
  /** not needed? can just search the text for the word captain */
  captain?: boolean;
  playerComparison?: Comparison;
  value?: number;
};
const exampleTasks: TaskStuff[] = [
  {
    // I will win a 6 with another 6
    layout: 'two-by-two',
    cards: [6, 6],
    text: 'I will win a 6 with another 6',
  },
  {
    layout: 'inline-image',
    text: 'I will win the green 2 in the final trick of the game',
    cards: ['G2'],
  },
  { layout: 'bottom-image', text: 'I will win exactly 1x pink and 1x green', cards: ['P', 'G'] },
  { layout: 'no-image', text: 'I will win exactly 4 tricks' },
  {
    layout: 'bottom-image',
    text: 'I will win more tricks than the Captain',
    subscriptText: 'I am not the Captain',
    captain: true,
  },
  { layout: 'bottom-image', text: 'I will win a trick of which the card values are all greater than 5', value: 5 },
];
console.log(exampleTasks);

function taskRenderer({ layout, text, subtext }: TasksDataEntry) {
  const subscript = subtext;
  const { cards, type, playerComparison, value, cardLayout = 'fan' } = layout;
  const Image = () =>
    cards ? (
      <CardArrangement type={cardLayout} cards={parse(cards)} />
    ) : playerComparison ? (
      <SuitSymbol suit={Suit.BLUE} />
    ) : value ? (
      <ValueSymbol value={value} />
    ) : (
      <></>
    );
  return (
    <CardIconBase>
      <div className={styles.taskCardContainer}>
        <div className={styles.taskCardContent}>
          {type === 'bottom-image' ? (
            <>
              {/* Text */}
              <div className={styles.taskTextContainer}>{parseTaskText(text, type)}</div>
              {/* Image  */}
              <Image />
              {/* Subscript */}
              {subscript ? <div className={styles.subscriptContainer}>{subscript}</div> : null}
            </>
          ) : type === 'inline-image' ? (
            <></>
          ) : type === 'two-by-two' ? (
            <></>
          ) : (
            <div className={styles.taskTextContainer}>{parseTaskText(text, type)}</div>
          )}
        </div>
      </div>
    </CardIconBase>
  );
}

function parseTaskText(text: string, type: TaskLayout) {
  // get text split indices by finding all splitters (I will win, 2x, green 7, )
  // splitters are conditional on the layout type: for text-only (no-image),
  //    text is split by finding a quantity (number or "X")
  //

  const textElements = text.split(getTextSplitters(type)).filter(Boolean);

  const processedElements = textElements.map((el, i) => {
    const text = el.trim();
    if (text === 'I will win')
      return (
        <>
          <span key={text} className={styles.textSmall}>
            {text}
          </span>
          <br />
        </>
      );
    if (type === 'no-image' && text.match(/\d|X/)) return <span className={styles.textLarge}>{text}</span>;
    return <span key={i + text}>{text}</span>;
  });
  // if (text.startsWith('I will win')) {
  //   textElements.push(<span>{text.slice(0, 9).trim()}</span>);
  // }
  console.log(textElements);
  return <>{...processedElements}</>;
}
function getTextSplitters(type: TaskLayout) {
  const baseSplitters = ['(I will win)', '\\dx'];
  if (type === 'no-image') baseSplitters.push('(\\d|X)');
  // if (type === 'bottom-image') baseSplitters.push('\\d', 'the blue|the black|the yellow|the pink|the green');
  return new RegExp(baseSplitters.join('|'), 'g');
}
/** 
 * parser/renderer should:
    - shrink 'I will win'
    - add quantity tags when 1x is found
    - add captain image when 'Captain' is found
    - enlarge the quantity for text-only tasks

 * 
 *  */

// function parseTaskText(text: string, layout: TaskLayout) {
//   const imageRegex = {
//     card: /(green|black|yellow|pink|blue) \d/gi,
//     value: /value/gi,
//     captain: /captain/gi,
//     playerComparison: /else/gi,
//     quantityTag: /\dx/g,
//   };
//   function getImageType(text: string) {
//     if (text.search(imageRegex.card) > -1) return ;
//   }
//   return {};
// }
