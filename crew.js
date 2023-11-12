const game = {
	players: [
    { 
    	id: 0, // should match array index
      name: 'Nathan',
      hand: [{ number: 9, suit: 'blue'}, { number: 7, suit: 'blue' }],
      hint: { used: true, card: { number: 9, suit: 'blue'}, placement: 'top' },
      goals: [{ id: 23, done: false }, { id: 14, done: true }],
      isCaptain: true,
      isDealer: true,
      extraCards: 1,
    },
    { 
    	id: 1, // should match array index
      name: 'Eric',
      hand: [{ number: 9, suit: 'green'}, { number: 7, suit: 'green' }],
      hint: { used: false },
      goals: [],
      isCaptain: false,
      isDealer: false,
      extraCards: 0,
    },
    { 
    	id: 2, // should match array index
      name: 'Melora',
      hand: [{ number: 9, suit: 'pink'}, { number: 7, suit: 'yellow' }],
      hint: { used: false },
      goals: [],
      isCaptain: false,
      isDealer: false,
      extraCards: 0,
    }
  ],
  tricks: [
  	{
    	winner: 0, // Nathan
      leader: 1,
      cards: [
      	{ number: 3, suit: 'green' },
        { number: 5, suit: 'green' },
        { number: 9, suit: 'blue' },
      ],
    },
    {
    	winner: null,
      leader: 0,
      cards: [
        { number: 4, suit: 'pink' },
      ],
    },
  ],
  unassignedGoals: [],
};


function getCaptainId(state) {
	return state.players.find(player => player.isCaptain).id;
}

function getDealerName(state) {
	return state.players.find(player => player.isDealer).name;
}

function getPlayerName(state, playerId) {
  return state.players[playerId].name;
}

function getUnassignedGoalsExist(state) {
	return !!state.unassignedGoals.length;
}

function getIsPlayerDealer(state, playerId) {
	return state.players[playerId].isDealer;
}

function getNumberOfPlayers(state) {
	return state.players.length;
}

function getIsGameFinished(state) {
	const tricksInGameByPlayers = { '3': 13, '4': 10, '5': 8 };
  const numberOfPlayers = getNumberOfPlayers(state);
  const tricksInGame = tricksInGameByPlayers[`${numberOfPlayers}`];
  return state.tricks.length === tricksInGame && state.tricks[tricksInGame - 1].cards.length === numberOfPlayers;
}

function getAreAllGoalsDone(state) {
	return !state.players.find(player => player.goals.find(goal => !goal.done));
}

function getCurrentTrickId(state) {
	return state.tricks.length - 1;
}

function getCurrentTrick(state) {
	return state.tricks[getCurrentTrickId(state)];
}

function getNextPlayerId(state) {
	if (!state.tricks.length) {
  	return getCaptainId(state);
  }
  const currentTrick = getCurrentTrick(state);
  const numberOfPlayers = getNumberOfPlayers(state);
  if (currentTrick.cards && currentTrick.cards.length === numberOfPlayers) {
  	return currentTrick.winner;
  }
  return currentTrick.leader + (currentTrick.cards ? currentTrick.cards.length : 0) % numberOfPlayers;
}

function getStatusText(state, playerId) {
	if (getUnassignedGoalsExist(state)) {
  	if (getIsPlayerDealer(state, playerId)) {
    	return `Discuss the goal cards with your teammates. Press and hold to claim one.\nOnce all goals are claimed, you may start the game.`;
    }
  	return `Discuss the goal cards with your teammates. Press and hold to claim one.\n${getDealerName(state)} will start the game once all goals are claimed.`;
  }
  
  if (getIsGameFinished(state)) {
  	if (getAreAllGoalsDone(state)) {
    	return `Game complete. You won!`
    }
    return `Game complete. You lost.`
  }
  
  const nextPlayerId = getNextPlayerId(state);
  if (nextPlayerId === playerId) {
  	return `Choose a card to play`;
  }
  return `Waiting for ${getPlayerName(nextPlayerId)} to play a card`;
}

function playCard(state, playerId, card) {
	// TODO: update to use firestore batch API instead of mutating state
  
  if (getNextPlayerId(state) !== playerId) {
  	throw new Error(`${getPlayerName(playerId)} is trying to play out of turn`);
  }

  // TODO: remove card from hand
  
  const latestTrick = getCurrentTrick(state);
  if (latestTrick.cards && latestTrick.cards.length === getNumberOfPlayers(state)) {
  	const newTrick = {
    	winner: null,
      leader: playerId,
      cards: [card],
    };
    state.tricks.push(newTrick); // TODO: batch instead of mutate
  } else {
  	updatedTrick = {
    	...latestTrick,
      cards: [...latestTrick.cards || [], card],
    };
    if (updatedTrick.cards.length === getNumberOfPlayers(state)) {
    	// compute the winner
      let highestBlackPos = null;
      let highestLedPos = 0;
      updatedTrick.cards.forEach((trickCard, index) => {
      	if (trickCard.suit === 'black' && (highestBlackPos === null || updatedTrick.cards[highestBlackPos].number < trickCard.number)) {
        	highestBlackPos = index;
        }
        if (highestBlackPos === null && trickCard.suit === updatedTrick.cards[0].suit && updatedTrick.cards[highestLedPos].number < trickCard.number) {
        	highestLedPos = index;
        }
      });
      const winningPos = highestBlackPos !== null ? highestBlackPos : highestLedPos;
      updatedTrick.winner = winningPos - updatedTrick.leader % getNumberOfPlayers(state);
      // TODO: computer if any goals have been completed
    }
    state.tricks[getCurrentTrickId(state)] = updatedTrick; // TODO: batch instead of mutate
  }
}






// shuffle and deal
const cards = [
	...[...Array(9).keys()].map(i => ({ number: i + 1, suit: 'blue' })),
	...[...Array(9).keys()].map(i => ({ number: i + 1, suit: 'green' })),
	...[...Array(9).keys()].map(i => ({ number: i + 1, suit: 'yellow' })),
	...[...Array(9).keys()].map(i => ({ number: i + 1, suit: 'pink' })),
	...[...Array(4).keys()].map(i => ({ number: i + 1, suit: 'black' })),
];
const suitOrder = {
	'black': 0,
  'blue': 1,
  'green': 2,
  'yellow': 3,
  'pink': 4,
}
for (let i = cards.length - 1; i > 0; i--) {
	const randomIndex = Math.floor(Math.random() * (i + 1));
  [cards[i], cards[randomIndex]] = [cards[randomIndex], cards[i]];
}
const players = [{hand:[]}, {hand:[]}, {hand:[]}];
const numberOfPlayers = players.length;
const dealer = 1;
for (let i = 0; i < cards.length; i++) {
	const player = (i + dealer) % numberOfPlayers;
  const card = cards[i];
  players[player].hand.push(card);
  if (card.number === 4 && card.suit === 'black') {
  	players[player].isCaptain = true;
  }
}
const minHandSize = Math.min(...players.map(player => player.hand.length));
for (const player of players) {
	player.extraCards = player.hand.length - minHandSize;
  player.hand = player.hand.sort((a, b) => {
  	if (a.suit !== b.suit) {
    	return suitOrder[a.suit] - suitOrder[b.suit];
    }
    return b.number - a.number;
  });
}