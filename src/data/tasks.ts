import { TasksData } from "../types";

export default {
  '0': {
    id: 0,
    text: 'I will win 3 tricks in a row',
    subtext: '',
    difficulty: [ 2, 3, 4 ]
  },
  '1': {
    id: 1,
    text: 'I will win exactly 2 green',
    subtext: '',
    difficulty: [ 3, 4, 4 ]
  },
  '2': {
    id: 2,
    text: 'I will win fewer tricks than the Captain',
    subtext: 'I am not the Captain',
    difficulty: [ 2, 2, 2 ]
  },
  '3': {
    id: 3,
    text: 'I will win none of the first 4 tricks',
    subtext: '',
    difficulty: [ 1, 2, 3 ]
  },
  '4': {
    id: 4,
    text: 'I will win exactly 2 tricks',
    subtext: '',
    difficulty: [ 2, 2, 2 ]
  },
  '5': {
    id: 5,
    text: 'I will win the first 3 tricks',
    subtext: '',
    difficulty: [ 2, 3, 4 ]
  },
  '6': {
    id: 6,
    text: 'I will win only the first trick',
    subtext: '',
    difficulty: [ 4, 3, 3 ]
  },
  '7': {
    id: 7,
    text: 'I will win at least 3x 5s',
    subtext: '',
    difficulty: [ 3, 4, 5 ]
  },
  '8': {
    id: 8,
    text: 'I will win more tricks than everyone else combined',
    subtext: '',
    difficulty: [ 3, 4, 5 ]
  },
  '9': {
    id: 9,
    text: 'I will win a trick of which the card values are all greater than 5',
    subtext: '',
    difficulty: [ 2, 3, 4 ]
  },
  '10': {
    id: 10,
    text: 'I will win a trick using a 6',
    subtext: '',
    difficulty: [ 2, 3, 3 ]
  },
  '11': {
    id: 11,
    text: 'I will win exactly 1x pink and 1x green',
    subtext: '',
    difficulty: [ 4, 4, 4 ]
  },
  '12': {
    id: 12,
    text: 'I will win the blue 4',
    subtext: '',
    difficulty: [ 1, 1, 1 ]
  },
  '13': {
    id: 13,
    text: 'I will win all 4x 9s',
    subtext: '',
    difficulty: [ 4, 5, 6 ]
  },
  '14': {
    id: 14,
    text: 'I will win a trick with a total value less than 8/12/16',
    subtext: 'Submarines are not allowed in the trick',
    difficulty: [ 3, 3, 4 ]
  },
  '15': {
    id: 15,
    text: 'I will win as many tricks as the Captain',
    subtext: 'I am not the Captain',
    difficulty: [ 4, 3, 3 ]
  },
  '16': {
    id: 16,
    text: 'I will win the pink 3',
    subtext: '',
    difficulty: [ 1, 1, 1 ]
  },
  '17': {
    id: 17,
    text: 'I will win the yellow 1',
    subtext: '',
    difficulty: [ 1, 1, 1 ]
  },
  '18': {
    id: 18,
    text: 'I will win exactly 4 tricks',
    subtext: '',
    difficulty: [ 2, 3, 5 ]
  },
  '19': {
    id: 19,
    text: 'I will win more pink than green cards',
    subtext: '0 green cards is allowed',
    difficulty: [ 1, 1, 1 ]
  },
  '20': {
    id: 20,
    text: 'I will win a trick using a 3',
    subtext: '',
    difficulty: [ 3, 4, 5 ]
  },
  '21': {
    id: 21,
    text: 'I will win no yellow',
    subtext: '',
    difficulty: [ 2, 2, 2 ]
  },
  '22': {
    id: 22,
    text: 'I will win exactly 1x submarine',
    subtext: 'If submarine cards 1,2,3,4 are in one hand, re-deal the playing cards',
    difficulty: [ 3, 3, 3 ]
  },
  '23': {
    id: 23,
    text: 'I will win exactly 3 tricks and they will be in a row',
    subtext: '',
    difficulty: [ 3, 3, 4 ]
  },
  '24': {
    id: 24,
    text: 'I will win none of the first 3 tricks',
    subtext: '',
    difficulty: [ 1, 2, 2 ]
  },
  '25': {
    id: 25,
    text: 'I will win exactly 1x pink',
    subtext: '',
    difficulty: [ 3, 3, 4 ]
  },
  '26': {
    id: 26,
    text: 'I will not open a trick with pink, yellow, or blue',
    subtext: '',
    difficulty: [ 4, 3, 3 ]
  },
  '27': {
    id: 27,
    text: 'I will win a trick that contains only odd-numbered cards',
    subtext: '',
    difficulty: [ 2, 4, 5 ]
  },
  '28': {
    id: 28,
    text: 'I will win no pink or blue',
    subtext: '',
    difficulty: [ 3, 3, 3 ]
  },
  '29': {
    id: 29,
    text: 'I will win a trick that contains only even-numbered cards',
    subtext: '',
    difficulty: [ 2, 5, 6 ]
  },
  '30': {
    id: 30,
    text: 'I will win a 6 with another 6',
    subtext: '',
    difficulty: [ 2, 3, 4 ]
  },
  '31': {
    id: 31,
    text: 'I will win at least 3x 9s',
    subtext: '',
    difficulty: [ 3, 4, 5 ]
  },
  '32': {
    id: 32,
    text: 'I will win the green 6',
    subtext: '',
    difficulty: [ 1, 1, 1 ]
  },
  '33': {
    id: 33,
    text: 'I will win exactly 2x blue',
    subtext: '',
    difficulty: [ 3, 4, 4 ]
  },
  '34': {
    id: 34,
    text: 'I will win the black 3',
    subtext: '',
    difficulty: [ 1, 1, 1 ]
  },
  '35': {
    id: 35,
    text: 'I will win the green 9 with a black',
    subtext: '',
    difficulty: [ 3, 3, 3 ]
  },
  '36': {
    id: 36,
    text: 'I will win a trick of which the card values are all less than 7',
    subtext: 'Submarines are not allowed in the trick',
    difficulty: [ 2, 3, 3 ]
  },
  '37': {
    id: 37,
    text: 'I will win the first 2 tricks',
    subtext: '',
    difficulty: [ 1, 1, 2 ]
  },
  '38': {
    id: 38,
    text: 'I will win the black 1 and no other submarine',
    subtext: 'If submarine cards 1 and 4 or 1,2,3 are in one hand, redeal the playing cards',
    difficulty: [ 3, 3, 3 ]
  },
  '39': {
    id: 39,
    text: 'I will win all the cards in at least one of the 4 colors',
    subtext: '',
    difficulty: [ 3, 4, 5 ]
  },
  '40': {
    id: 40,
    text: 'I will win as many pink as yellow cards',
    subtext: '0 pink/yellow cards is not allowed',
    difficulty: [ 4, 4, 4 ]
  },
  '41': {
    id: 41,
    text: 'I will win the green 3, yellow 4, and yellow 5',
    subtext: '',
    difficulty: [ 3, 4, 4 ]
  },
  '42': {
    id: 42,
    text: 'I will win a 5 with a 7',
    subtext: '',
    difficulty: [ 1, 2, 2 ]
  },
  '43': {
    id: 43,
    text: 'I will win as many green as yellow cards in one trick',
    subtext: '0 green/yellow cards is not allowed',
    difficulty: [ 2, 3, 3 ]
  },
  '44': {
    id: 44,
    text: 'I will win no pink',
    subtext: '',
    difficulty: [ 2, 2, 2 ]
  },
  '45': {
    id: 45,
    text: 'I will win the blue 1, blue 2, and blue 3',
    subtext: '',
    difficulty: [ 2, 3, 3 ]
  },
  '46': {
    id: 46,
    text: 'I will win none of the first 5 tricks',
    subtext: '',
    difficulty: [ 2, 3, 3 ]
  },
  '47': {
    id: 47,
    text: 'I will win no 1s',
    subtext: '',
    difficulty: [ 2, 2, 2 ]
  },
  '48': {
    id: 48,
    text: 'I will win no 8s and no 9s',
    subtext: '',
    difficulty: [ 3, 3, 2 ]
  },
  '49': {
    id: 49,
    text: 'I will win a trick with a total value greater than 23/28/31',
    subtext: 'Submarines are not allowed in the trick',
    difficulty: [ 3, 3, 4 ]
  },
  '50': {
    id: 50,
    text: 'I will win exactly 3x black',
    subtext: 'If submarine cards 1,2,3,4 are in one hand, re-deal the playing cards',
    difficulty: [ 3, 4, 4 ]
  },
  '51': {
    id: 51,
    text: 'I will win exactly 3x 6s',
    subtext: '',
    difficulty: [ 3, 4, 4 ]
  },
  '52': {
    id: 52,
    text: 'I will win all 4x 3s',
    subtext: '',
    difficulty: [ 3, 4, 5 ]
  },
  '53': {
    id: 53,
    text: 'I will win at least 5x pink',
    subtext: '',
    difficulty: [ 2, 3, 3 ]
  },
  '54': {
    id: 54,
    text: 'I will win the pink 7 with a black',
    subtext: '',
    difficulty: [ 3, 3, 3 ]
  },
  '55': {
    id: 55,
    text: 'I will win more tricks than the Captain',
    subtext: 'I am not the Captain',
    difficulty: [ 2, 2, 3 ]
  },
  '56': {
    id: 56,
    text: 'I will win no black',
    subtext: '',
    difficulty: [ 1, 1, 1 ]
  },
  '57': {
    id: 57,
    text: 'I will win more yellow than blue cards',
    subtext: '0 blue cards is allowed',
    difficulty: [ 1, 1, 1 ]
  },
  '58': {
    id: 58,
    text: 'I will win 2 tricks in a row',
    subtext: '',
    difficulty: [ 1, 1, 1 ]
  },
  '59': {
    id: 59,
    text: 'I will win no 5s',
    subtext: '',
    difficulty: [ 1, 2, 2 ]
  },
  '60': {
    id: 60,
    text: 'I will win the yellow 9 and the blue 7',
    subtext: '',
    difficulty: [ 2, 3, 3 ]
  },
  '61': {
    id: 61,
    text: 'I will win a trick using a 5',
    subtext: '',
    difficulty: [ 2, 3, 4 ]
  },
  '62': {
    id: 62,
    text: 'I will win no 9s',
    subtext: '',
    difficulty: [ 1, 1, 1 ]
  },
  '63': {
    id: 63,
    text: 'I will win the green 5 and the blue 8',
    subtext: '',
    difficulty: [ 2, 2, 3 ]
  },
  '64': {
    id: 64,
    text: 'I will not open a trick with pink or green',
    subtext: '',
    difficulty: [ 2, 1, 1 ]
  },
  '65': {
    id: 65,
    text: 'I will win more tricks than anyone else',
    subtext: '',
    difficulty: [ 2, 3, 3 ]
  },
  '66': {
    id: 66,
    text: 'I will win the pink 8 and the blue 5',
    subtext: '',
    difficulty: [ 2, 2, 3 ]
  },
  '67': {
    id: 67,
    text: 'I will win the pink 5 and the yellow 6',
    subtext: '',
    difficulty: [ 2, 2, 3 ]
  },
  '68': {
    id: 68,
    text: 'I will win at least 2x 7s',
    subtext: '',
    difficulty: [ 2, 2, 2 ]
  },
  '69': {
    id: 69,
    text: 'I will win the first trick',
    subtext: '',
    difficulty: [ 1, 1, 1 ]
  },
  '70': {
    id: 70,
    text: 'I will never win 2 tricks in a row',
    subtext: '',
    difficulty: [ 3, 2, 2 ]
  },
  '71': {
    id: 71,
    text: 'I will win exactly 1 trick',
    subtext: '',
    difficulty: [ 3, 2, 2 ]
  },
  '72': {
    id: 72,
    text: 'I will won the blue 6 and the yellow 7',
    subtext: '',
    difficulty: [ 2, 2, 3 ]
  },
  '73': {
    id: 73,
    text: 'I will win fewer tricks than everyone else',
    subtext: '',
    difficulty: [ 2, 2, 3 ]
  },
  '74': {
    id: 74,
    text: 'I will win the pink 1 and the green 7',
    subtext: '',
    difficulty: [ 2, 2, 2 ]
  },
  '75': {
    id: 75,
    text: 'I will win the black 2 and no other submarines',
    subtext: 'If submarine cards 2 and 4 or 1,2,3 are in one hand, re-deal the playing cards',
    difficulty: [ 3, 3, 3 ]
  },
  '76': {
    id: 76,
    text: 'I will win exactly 2x black',
    subtext: 'If submarine cards 2,3,4 are in one hand, re-deal the playing cards',
    difficulty: [ 3, 3, 4 ]
  },
  '77': {
    id: 77,
    text: 'I will win an 8 with a 4',
    subtext: '',
    difficulty: [ 3, 4, 5 ]
  },
  '78': {
    id: 78,
    text: 'I will win the green 2 in the final trick kf the game',
    subtext: '',
    difficulty: [ 3, 4, 5 ]
  },
  '79': {
    id: 79,
    text: 'I will win a trick with a total value of 22 or 23',
    subtext: 'Submarines are not allowed in the trick',
    difficulty: [ 3, 3, 4 ]
  },
  '80': {
    id: 80,
    text: 'I will win as many pink as blue cards in one trick',
    subtext: '0 pink/blue cards is not allowed',
    difficulty: [ 2, 3, 3 ]
  },
  '81': {
    id: 81,
    text: 'I will win at least 7x yellow',
    subtext: '',
    difficulty: [ 3, 3, 3 ]
  },
  '82': {
    id: 82,
    text: 'I will win exactly 2x 9s',
    subtext: '',
    difficulty: [ 2, 3, 3 ]
  },
  '83': {
    id: 83,
    text: 'I will win only the last trick',
    subtext: '',
    difficulty: [ 4, 4, 4 ]
  },
  '84': {
    id: 84,
    text: 'I will win no yellow and no green',
    subtext: '',
    difficulty: [ 3, 3, 3 ]
  },
  '85': {
    id: 85,
    text: 'I will win 0 tricks',
    subtext: '',
    difficulty: [ 4, 3, 3 ]
  },
  '86': {
    id: 86,
    text: 'I will win the first and the last trick',
    subtext: '',
    difficulty: [ 3, 4, 4 ]
  },
  '87': {
    id: 87,
    text: 'I will win a trick using a 2',
    subtext: '',
    difficulty: [ 3, 4, 5 ]
  },
  '88': {
    id: 88,
    text: 'I will win the last trick',
    subtext: '',
    difficulty: [ 2, 3, 3 ]
  },
  '89': {
    id: 89,
    text: 'I will win at least one card of each color',
    subtext: '',
    difficulty: [ 2, 3, 4 ]
  },
  '90': {
    id: 90,
    text: 'I will win X tricks',
    subtext: 'Note your prediction but keep it secret',
    difficulty: [ 4, 3, 3 ]
  },
  '91': {
    id: 91,
    text: 'l will win X tricks',
    subtext: 'Note your prediction and share it with the crew',
    difficulty: [ 3, 2, 2 ]
  },
  '92': {
    id: 92,
    text: 'I will win the pink 9 and the yellow 8',
    subtext: '',
    difficulty: [ 2, 3, 3 ]
  },
  '93': {
    id: 93,
    text: 'I will win exactly 2 tricks and they will be in a row',
    subtext: '',
    difficulty: [ 3, 3, 3 ]
  },
  '94': {
    id: 94,
    text: 'I will win no green',
    subtext: '',
    difficulty: [ 2, 2, 2 ]
  },
  '95': {
    id: 95,
    text: 'I will win no 1s, no 2s, and no 3s',
    subtext: '',
    difficulty: [ 3, 3, 3 ]
  }
} as TasksData;