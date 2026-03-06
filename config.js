let cards = [];
let isAlive = false;
let hasBlackjack = false;
let sum = 0;
let message = "";

let newGameBtn = document.getElementById("start-btn");
let cardsEl = document.getElementById("cards-el");
let sumEl = document.getElementById("sum-el");
let messageEl = document.getElementById("message-el");
let balanceEl = document.getElementById("balance-el");
let betEl = document.getElementById("bet-el");

let balance = 200;
let currentBet = 0; // Starts at 0 so they don't auto-bet!

// Event Listeners
document
  .getElementById("decrease-bet-btn")
  .addEventListener("click", decreaseBet);
document
  .getElementById("increase-bet-btn")
  .addEventListener("click", increaseBet);

updateUI();

function getRandomCard() {
  let randomNumber = Math.floor(Math.random() * 13) + 1;
  if (randomNumber > 10) return 10;
  if (randomNumber === 1) return 11;
  return randomNumber;
}

// NEW: Dynamic Ace Calculator
function calculateScore(cardArray) {
  let tempSum = 0;
  let aces = 0;

  for (let card of cardArray) {
    tempSum += card;
    if (card === 11) aces++;
  }

  // If we bust, but we have an Ace, drop the Ace from 11 to 1 (subtract 10)
  while (tempSum > 21 && aces > 0) {
    tempSum -= 10;
    aces--;
  }

  return tempSum;
}

function startGame() {
  // Prevent mid-game reset exploit
  if (isAlive) return;

  // The "Broke" Soft-Lock Fix (Check if < 10, not === 0)
  if (balance < 10 && currentBet === 0) {
    balance = 200;
    currentBet = 0;
    cardsEl.textContent = "—";
    sumEl.textContent = "0";
    messageEl.textContent = "Bankroll reset to $200! Place a bet! 💸";
    newGameBtn.textContent = ""; // Reset text if bankrupt
    updateUI();
    return;
  }

  // Prevent playing without betting
  if (currentBet === 0) {
    messageEl.textContent = "Please place a bet first!";
    return;
  }

  isAlive = true;
  hasBlackjack = false;

  // NEW: Revert the button text back to Deal Cards!
  newGameBtn.textContent = "Deal Cards";

  let firstCard = getRandomCard();
  let secondCard = getRandomCard();
  cards = [firstCard, secondCard];

  // Use our new Ace-friendly math
  sum = calculateScore(cards);
  renderGame();
}

function renderGame() {
  cardsEl.textContent = cards.join(" ");
  sumEl.textContent = sum;

  if (sum <= 20) {
    message = "Hit or Stand?";
  } else if (sum === 21) {
    message = "Blackjack! You win! 🥳";
    hasBlackjack = true;
    isAlive = false;
    newGameBtn.textContent = "New Game"; // NEW: Update on Blackjack
    payout(true);
  } else {
    message = "Bust! You lose. 😭";
    isAlive = false;
    newGameBtn.textContent = "New Game"; // You already had this perfectly!
    payout(false);
  }
  messageEl.textContent = message;
}

function newCard() {
  if (isAlive === true && hasBlackjack === false) {
    let card = getRandomCard();
    cards.push(card);
    sum = calculateScore(cards); // Ace-friendly math
    renderGame();
  }
}

function stand() {
  if (isAlive === true) {
    isAlive = false;
    let dealerSum = 0;
    let dealerAces = 0;

    // Dealer needs dynamic Aces too!
    while (dealerSum < 17) {
      let card = getRandomCard();
      dealerSum += card;
      if (card === 11) dealerAces++;

      while (dealerSum > 21 && dealerAces > 0) {
        dealerSum -= 10;
        dealerAces--;
      }
    }

    if (dealerSum > 21) {
      message = "Dealer busts! You win! 🥳";
      payout(true);
    } else if (dealerSum > sum) {
      message = "Dealer wins with " + dealerSum + ". 😭";
      payout(false);
    } else if (dealerSum < sum) {
      message = "You win! Dealer had " + dealerSum + ". 🥳";
      payout(true);
    } else {
      message = "It's a tie! 🤝";
      // Push: Give the bet back to the balance
      balance += currentBet;
      currentBet = 0; // Clear the table
      updateUI();
    }

    messageEl.textContent = message;

    // NEW: Update the button text when the round is completely over
    newGameBtn.textContent = "New Game";
  }
}

// --- BETTING LOGIC ---
function updateUI() {
  balanceEl.textContent = "$" + balance;
  betEl.textContent = "$" + currentBet;
}

function increaseBet() {
  if (balance >= 10 && isAlive === false) {
    currentBet += 10;
    balance -= 10;
    updateUI();
  }
}

function decreaseBet() {
  if (currentBet > 0 && isAlive === false) {
    currentBet -= 10;
    balance += 10;
    updateUI();
  }
}

function payout(didWin) {
  // Fix the Double-Deduction Bug:
  // If they win, give double the bet back. If they lose, do nothing (money is already gone).
  if (didWin === true) {
    balance += currentBet * 2;
  }

  // Clear the bet for the next round
  currentBet = 0;

  updateUI();

  // If they lost everything, prompt a reset
  if (balance < 10) {
    messageEl.textContent = "Bankrupt! Click Deal to reset.";
  }
}
