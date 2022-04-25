/*
 ********************************************************************
 ******************** GLOBAL VARIABLES ******************************
 ********************************************************************
 */

let deck;
let bet = 1;
let points = 100;
const hand = [];
const heldCardIndex = [];

const cardNameTally = {};
const cardSuitTally = {};

const payout = {
  'Royal Flush': 800,
	'Straight Flush': 50,
	'Four of a Kind': 25,
	'Full House': 9,
	'Flush': 6,
	'Straight': 4,
	'Three of a Kind': 3,
	'Two Pairs': 2,
	'Jacks or Better': 1,
	'Better luck next round': -1,
}

// HTML
const mainContainer = document.createElement('main');
const topRow = document.createElement('div');
const pointsContainer = document.createElement('div');
const messageBoard = document.createElement('div');
const cardContainer = document.createElement('div');
const dealButton = document.createElement('button');
const payTableButton = document.createElement('button');
const payTable = document.createElement('div');

/*
 ********************************************************************
 ******************** HELPER FUNCTIONS ******************************
 ********************************************************************
 */

/* 
-------------------------------------------
##### Functions for constructing deck #####
------------------------------------------- 
*/

// Randomizer used in shuffling
const getRandomIndex = (max) => Math.floor(Math.random() * max);

const makeDeck = () => {
  const newDeck = [];
  //Set up card attributes
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const suitSymbols = ['♥️', '♦️', '♣️', '♠️'];
  const suitColors = ['red', 'red', 'black', 'black']
  const cardName = [
    		'A',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        'J',
        'Q',
        'K',
  ];
  const cardRank = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

  // Set up deck with a loop
  for (let suitIndex = 0; suitIndex < suits.length; suitIndex +=1){
     const currentSuit = suits[suitIndex];

     for (let cardNameIndex = 0; cardNameIndex < cardName.length; cardNameIndex += 1){
       // Create a card with current name, suit, color and rank
      const card = {
        name: cardName[cardNameIndex],
        suit: currentSuit,
        symbol : suitSymbols[suitIndex],
        color: suitColors[suitIndex],
        rank: cardRank[cardNameIndex]
      }
      //Put created card into the deck
      newDeck.push(card);
     }
  }
  //Output the newly created deck
  return newDeck;
}

// Shuffle cards
const shuffleCards = (deck) => {
  for (let i = 0; i < deck.length; i += 1){
    // Get card from deck to swap
    const randomIndex = getRandomIndex(deck.length);
    const randomCard = deck[randomIndex];
    const currentCard = deck[i];
    // Swapping action to swap cards
    deck[i] = randomCard;
    deck[randomIndex] = currentCard;
  }
  return deck
}

/* 
-------------------------------------------
##### Functions for manipulating DOM #####
------------------------------------------- 
*/

// Create empty card element divs

const createEmptyCardDivs = () => {
  cardContainer.innerHTML = ``;
  for (let i = 0; i < 5; i +=1){
    // Create div to hold card and message
    const cardWrapper = document.createElement('div');
    cardWrapper.classList.add('card-div');

    // Create div for message
    const message = document.createElement('div');
    message.classList.add('message');
    message.innerHTML = ``;

    // Create div for card specifically
    const card = document.createElement('div');
    card.classList.add('card', 'down');
    card.innerHTML = ``;

    // Put the card and message divs together
    cardWrapper.appendChild(message);
    cardWrapper.appendChild(card);

    // Put the card wrapper into the cardContainer div
    cardContainer.appendChild(cardWrapper);
  }
};

// Create dealt card element divs
const createCardDivs = () => {
  cardContainer.innerHTML = '';
  for (let i = 0; i < hand.length; i += 1){
    const currentCard = hand[i];

    // Create a wrapper for card and message
    const cardWrapper = document.createElement('div');
    cardWrapper.classList.add('card-div')

    // Create div for message
    const message = document.createElement('div');
    message.classList.add('message');
    message.innerHTML = ``;
    if (heldCardIndex.includes(i)){
      message.innerHTML = 'Hold';
    }

    // Create div for card specifically
    const card = document.createElement('div');
    card.classList.add('card', 'down');
    if (currentCard.color === 'red'){
      card.classList.add('red');
    } else {
      card.classList.add('black');
    }
    // Display card information
    card.innerHTML = '';
    if (currentCard !== '') {
      card.innerHTML = `${currentCard.name}<span class = "symbol">${currentCard.symbol}</span>`;
    }
    // Put the card and message divs together
    cardWrapper.appendChild(message);
    cardWrapper.appendChild(card);
    // Put the card wrapper into the cardContainer div
    cardContainer.appendChild(cardWrapper);

    // Add event listener to listen to each card
    cardWrapper.addEventListener('click', () => {
      toggleHold(message, i);
    });
  }
};

// Function to create the pay table div
const createPayTable = () => {
	for (key in payout) {
		let p = document.createElement('p');
		p.innerText = key;
		let span = document.createElement('span');
		span.style.color = '#00000';
		span.innerText = ` +${payout[key]}`;
		if (key === 'Better luck next round') {
			p.innerText = `Nothing`;
			span.innerText = ` ${payout[key]}`;
		}
		p.appendChild(span);
		payTable.appendChild(p);
	}

	let closeButton= document.createElement('button');
	closeButton.innerHTML = '<span style="font-size:1em;">Close</span>';
	closeButton.setAttribute('id', 'close-button');
	closeButton.addEventListener('click', () => {
		payTable.classList.toggle('hidden');
	});
	payTable.appendChild(closeButton);
};

// Function to update credits with points variable
const updatePoints = () => {
  pointsContainer.innerText = `CREDITS: ${points}`;
}

// Function to update message board
const updateMessageBoard = (message) => {
  messageBoard.innerText = message;
};

// Function to toggle between Deal / Draw
const toggleButton = () => {;
  if(dealButton.innerHTML === `Deal`){
    dealButton.innerHTML = `Draw`;
  } else {
    dealButton.innerHTML = `Deal`;
  }
};

// Function to hold/ unhold cards
const toggleHold = (message , currentCardIndex) => {
  if (!dealButton.disabled){
    if(message.innerHTML === ''){
      message.innerHTML = 'Hold';
      heldCardIndex.push(currentCardIndex);
    } else {
      message.innerHTML = '';
      const indexToRemove = heldCardIndex.indexOf(currentCardIndex);
      heldCardIndex.splice(indexToRemove, 1)
    }
    }
};

/* 
-------------------------------------------
##### Gameplay Helper Functions #####
------------------------------------------- 
*/

// Function to deal the cards
const dealCards = () => {
  // Start
  if (hand.length === 0){
        //Deal the first 5 hands
        for (let i = 0; i < 5; i += 1){
          hand.push(deck.pop());
        }
        // Show dealt hands
        createCardDivs();
        updateMessageBoard('Select cards to hold');
        toggleButton();
      }
  // Hold code path
  else {
        for (let i = 0; i < hand.length; i+= 1){
          if (!heldCardIndex.includes(i)){
            hand[i] = deck.pop();
          }
        }
  //Show new hand
  createCardDivs();
  let outcome = checkForWin();
  const pointDiff = getWinnings(outcome);
  updateMessageBoard(outcome);;
  points += pointDiff;

  let pointDiffDiv = document.createTextNode(` ${pointDiff}`);
  if (pointDiff>=0){
    pointDiffDiv = document.createTextNode(` +${pointDiff}`);
  }
  pointsContainer.appendChild(pointDiffDiv);

  dealButton.disabled = true;
  setTimeout(newGame, 3500);
  }
};

// Function to tally cards
const tallyCards = () => {
  //Clear card tally
  for (cardName in cardNameTally){
    delete cardNameTally[cardName];
  }
  for (cardSuit in cardSuitTally){
    delete cardSuitTally[cardSuit];
  }
  //Tally card name
  for (let i = 0; i < hand.length; i += 1){
    const cardName = hand[i].name;
    if (cardName in cardNameTally){
      cardNameTally[cardName] += 1;
    } else {
      cardNameTally[cardName] = 1;
    }
  }
  //Tally card suit
  for (let i = 0; i < hand.length; i += 1){
    const cardSuit = hand[i].suit;
    if (cardSuit in cardSuitTally){
      cardSuitTally[cardSuit] += 1;
    } else {
      cardSuitTally[cardSuit] = 1;
    }
  }
};

// Function to get winnings from payout
const getWinnings = (result) => {
  return bet * payout[result];
};

// Function to start a new game with same bet
const newGame = () => {
  deck.length = 0; // Clear deck each round
  deck = shuffleCards(makeDeck());

  hand.length = 0;
  heldCardIndex.length = 0;

  updatePoints();
  updateMessageBoard('Ready?');
  createEmptyCardDivs();

  dealButton.disabled = false;
  toggleButton();

  if (points <= 0){
    updateMessageBoard('Game over');
    dealButton.disabled = true;
  }
};

/*
 ********************************************************************
 ******************** GAME PLAY RULES******************************
 ********************************************************************
 */

 const countRank = () => {
   let runningRank = 1;

   const handCopy = [...hand];
   handCopy.sort((a, b) => {a.rank - b.rank;});
   
   // High straight (10, J, Q, K, A)
   if (
     Object.keys(cardNameTally).includes('A') && Object.keys(cardNameTally).includes('K')
   ){
     for (let i = 1; i < handCopy.length - 1; i += 1){
       if (handCopy[i].rank === handCopy[i+1].rank - 1){
         runningRank += 1
       }
     }
   }
   else {
     for (let i = 0; i < handCopy.length - 1; i += 1){
       if (handCopy[i].rank === handCopy[i + 1].rank - 1){
         runningRank += 1;
       }
     }
   }
   return runningRank;
 }

 const checkFlush = () => {
   // Royal flush (10, J, Q, K, A)
   if(
     countRank() === 4 &&
     Object.keys(cardNameTally).includes('A') &&
     Object.keys(cardNameTally).includes('K')
   ){
     return 'Royal Flush';
   }

   else if (countRank() === 5){
     return 'Straight flush';
   }

   else {
     return 'Flush';
   }
 };

 const checkForWin = (hand) => {
   tallyCards();
   let output;

   if (Object.values(cardSuitTally).includes(5)){
     output = checkFlush();
   }

   else if (Object.values(cardNameTally).includes(4)){
     output = 'Four of a Kind';
   }
   else if (
     Object.values(cardNameTally).includes(2) && Object.values(cardNameTally).includes(3)
   ){
     output = 'Full House';
   }
   else if (Object.values(cardNameTally).includes(3)){
     output = 'Three of a Kind';
   }
   else if (
     Object.values(cardNameTally).includes(2) && Object.values(cardNameTally).length === 3
   ){
     output = 'Two Pairs';
   }
   else if (
     cardNameTally['J'] === 2 ||
     cardNameTally['Q'] === 2 ||
     cardNameTally['K'] === 2 ||
     cardNameTally['A'] === 2
   ){
     output = 'Jacks or Better';
   }
   else if (Object.values(cardNameTally).length === 5){
    if (
      countRank() === 5 ||
      (countRank() === 4 && Object.keys(cardNameTally).includes('A') && Object.keys(cardNameTally).includes('K'))
    ){
      output = 'Straight';
    } else {
      output = 'Better luck next round';
    }
 }
else {
   output = 'Better luck next round';
 }
 return output;
 };

 /*
 ********************************************************************
 ******************** GAME INITIALIZATION******************************
 ********************************************************************
 */

 const initGame = () => {
   deck = shuffleCards(makeDeck());

   // Top row
   topRow.setAttribute('id', 'top-row');
   pointsContainer.setAttribute('id', 'points');

   // Bind div to elements
   topRow.appendChild(pointsContainer);
   topRow.appendChild(payTableButton);
   mainContainer.appendChild(topRow);
   mainContainer.appendChild(messageBoard);
   mainContainer.appendChild(dealButton);
   mainContainer.appendChild(cardContainer);
   document.body.appendChild(payTable);
   document.body.appendChild(mainContainer);

   
   // Middle area
   messageBoard.setAttribute('id', 'message');
   dealButton.setAttribute('id', 'deal-button');
   cardContainer.setAttribute('id', 'card-container');

   // Bottom row
   payTableButton.setAttribute('id', 'paytable-button');
   payTable.classList.add('paytable', 'hidden');

   // Add content to divs
   updatePoints();
   messageBoard.innerHTML = 'Ready?';
   toggleButton();
   createCardDivs();
   payTableButton.innerText='Learn Scoring';
   createPayTable();

   // Add event listeners to buttons
   dealButton.addEventListener('click', () => {
     dealCards();
   });

   payTableButton.addEventListener('click', () => {
     payTable.classList.toggle('hidden');
   })
 };

 initGame();