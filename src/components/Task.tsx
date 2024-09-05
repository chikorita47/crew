import React from 'react';
import SuitSymbol from './SuitSymbol';
import { Card, Comparison, Suit, TasksDataEntry } from '@/types';
import type { CardShorthand } from '@/data/shorthandParser';
import styles from './task.module.css';
import parse from '@/data/shorthandParser';
import ValueSymbol from './ValueSymbol';

import NumberSymbol from './Number';
import CaptainSymbol from './CaptainSymbol';

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

type TaskProps = TasksDataEntry & { playerCount?: number };
function Task({ layout, text, subtext }: TaskProps) {
  if (!layout) return <></>;
  const subscript = subtext;
  const { cards, type, playerComparison, value, cardLayout = 'fan', cardExtras } = layout;

  // Validate cardExtras
  const cardArrangementExtras: Pick<CardArrangementProps, 'quantityTag' | 'topText'> = {};
  if (cards && cardExtras) {
    if (cardExtras.length !== cards.length) {
      throw new Error(
        `cardExtras array length must equal cards length in task layout property for: 
        \t${text}`,
      );
    }

    if (typeof cardExtras[0] === 'number') cardArrangementExtras.quantityTag = cardExtras as number[];
    if (typeof cardExtras[0] === 'string') cardArrangementExtras.topText = cardExtras as string[];
  }

  const Image = () =>
    cards ? (
      <CardArrangement type={cardLayout} cards={parse(cards)} taskType={type} {...cardArrangementExtras} />
    ) : playerComparison ? (
      <SuitSymbol suit={Suit.BLUE} />
    ) : value ? (
      <ValueArrangement value={value} />
    ) : (
      // Captain
      <CaptainSymbol />
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
            </>
          ) : type === 'inline-image' ? (
            <>
              {/* Text */}
              {/* Image  */}
              <Image />
              {/* Text */}
            </>
          ) : type === 'two-by-two' ? (
            <>
              {/* Text 1 */}
              <span />
              {/* Grid */}
              <div className={styles.gridContainer}>
                <div className={styles.gridColumn}>
                  <span> </span>
                  <span> </span>
                </div>
                <div className={styles.gridColumn}>
                  <Image />
                </div>
              </div>
            </>
          ) : (
            <div className={styles.taskTextContainer}>{parseTaskText(text, type)}</div>
          )}
          {/* Subscript */}
          {subscript ? <div className={styles.subscriptContainer}>{subscript}</div> : null}
        </div>
      </div>
    </CardIconBase>
  );
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
  quantityTag?: number[];
  topText?: string[];
  taskType?: TaskLayout;
};

function CardArrangement({ cards, type, quantityTag, topText, taskType }: CardArrangementProps) {
  return (
    <div className={getArrangementStyle(cards.length, type, taskType)}>
      {cards.map((card, i) => {
        return (
          <div key={`${card.suit || 'all'}-${card.number || 'any'}-${i}`} className={styles.cardExtrasContainer}>
            {topText ? <span className={styles.cardExtrasTopText}>{topText}</span> : null}

            <CardIcon suit={card.suit} number={card.number} />
          </div>
        );
      })}
    </div>
  );
}
type ValueArrangementProps = { value: number | number[]; delimiter?: string };
function ValueArrangement({ value, delimiter = 'or' }: ValueArrangementProps) {
  if (typeof value === 'number') return <ValueSymbol value={value} />;
  if (value.length === 1) return <ValueSymbol value={value[0]} />;
  if (value.length !== 2) throw new Error(`Unsupported length of value array in <ValueArrangement />: ${value.length}`);

  return (
    <div className={styles.valueArrangement}>
      <ValueSymbol value={value[0]} />
      <span className={styles.valueDelimiter}>{delimiter}</span>
      <ValueSymbol value={value[1]} />
    </div>
  );
}

function getArrangementStyle(numCards: number, type: CardArrangementType, taskType?: TaskLayout) {
  // returns the style of the Arrangement container based on the number of cards in the arrangement,
  // and the type of arrangement
  // if (numCards === 1) return {};
  // if (numCards >= 2) return { flexDirection: 'row', display: 'flex' };
  if (taskType === 'two-by-two') return styles.cardArrangementTwoByTwo;

  return styles.cardArrangementContainer;
}

// type TaskStuff = {
//   layout: TaskLayout;
//   text: string;
//   subscriptText?: string;
//   cards?: Array<CardShorthand | number | SuitLetter>;
//   /** not needed? can just search the text for the word captain */
//   captain?: boolean;
//   playerComparison?: Comparison;
//   value?: number;
// };
// const exampleTasks: TaskStuff[] = [
//   {
//     // I will win a 6 with another 6
//     layout: 'two-by-two',
//     cards: [6, 6],
//     text: 'I will win a 6 with another 6',
//   },
//   {
//     layout: 'inline-image',
//     text: 'I will win the green 2 in the final trick of the game',
//     cards: ['G2'],
//   },
//   { layout: 'bottom-image', text: 'I will win exactly 1x pink and 1x green', cards: ['P', 'G'] },
//   { layout: 'no-image', text: 'I will win exactly 4 tricks' },
//   {
//     layout: 'bottom-image',
//     text: 'I will win more tricks than the Captain',
//     subscriptText: 'I am not the Captain',
//     captain: true,
//   },
//   { layout: 'bottom-image', text: 'I will win a trick of which the card values are all greater than 5', value: 5 },
// ];
// console.log(exampleTasks);

// function taskRenderer({ layout, text, subtext }: TasksDataEntry) {
//   const subscript = subtext;
//   const { cards, type, playerComparison, value, cardLayout = 'fan' } = layout;
//   const Image = () =>
//     cards ? (
//       <CardArrangement type={cardLayout} cards={parse(cards)} />
//     ) : playerComparison ? (
//       <SuitSymbol suit={Suit.BLUE} />
//     ) : value ? (
//       <ValueSymbol value={value} />
//     ) : (
//       <></>
//     );
//   return (
//     <CardIconBase>
//       <div className={styles.taskCardContainer}>
//         <div className={styles.taskCardContent}>
//           {type === 'bottom-image' ? (
//             <>
//               {/* Text */}
//               <div className={styles.taskTextContainer}>{parseTaskText(text, type)}</div>
//               {/* Image  */}
//               <Image />
//               {/* Subscript */}
//               {subscript ? <div className={styles.subscriptContainer}>{subscript}</div> : null}
//             </>
//           ) : type === 'inline-image' ? (
//             <></>
//           ) : type === 'two-by-two' ? (
//             <></>
//           ) : (
//             <div className={styles.taskTextContainer}>{parseTaskText(text, type)}</div>
//           )}
//         </div>
//       </div>
//     </CardIconBase>
//   );
// }

// function getTaskSymbols(text: string, symbols: string[]) {
//   // Text-only
//   if (symbols.length === 0) return;

//   //
// }

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
    if (type === 'no-image' && text.match(/\d|X/)) return <span className={styles.textLarge}> {text} </span>;
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
