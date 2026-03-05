// --- VARIABLES & DOM SETUP (I left this intact for you) ---
let cards = [];
let isAlive = false;
let hasBlackjack = false;
let sum = 0;
let message = "";

let cardsEl = document.getElementById("cards-el");
let sumEl = document.getElementById("sum-el");
let messageEl = document.getElementById("message-el");
let balanceEl = document.getElementById("balance-el");
let betEl = document.getElementById("bet-el");

let balance = 200;
let currentBet = 100;

// Button Event Listeners
document
  .getElementById("decrease-bet-btn")
  .addEventListener("click", decreaseBet);
document
  .getElementById("increase-bet-btn")
  .addEventListener("click", increaseBet);

updateUI();

function getRandomCard() {
  let randomNumber = Math.floor(Math.random() * 13) + 1;
  if (randomNumber > 10) {
    return 10;
  } else if (randomNumber === 1) {
    return 11;
  } else {
    return randomNumber;
  }
}

function startGame() {
  // NEW: The Game Over / Reset Check
  if (balance === 0 && currentBet === 0) {
    // Give them a fresh bankroll
    balance = 200;
    currentBet = 100;
    
    // Reset the screen visuals back to default
    cardsEl.textContent = "—";
    sumEl.textContent = "0";
    messageEl.textContent = "Bankroll reset to $200! Good luck! 💸";
    
    updateUI();
    return; // Stop the function here so they see the reset message first!
  }

  // Your existing safety check
  if (isAlive === true || currentBet === 0) {
    return;
  }

  isAlive = true;
  hasBlackjack = false;

  let firstCard = getRandomCard();
  let secondCard = getRandomCard();
  cards = [firstCard, secondCard];
  sum = firstCard + secondCard;
  renderGame();
}

function renderGame() {
  cardsEl.textContent = " ";
  for (let i = 0; i < cards.length; i++) {
    cardsEl.textContent += cards[i] + " ";
  }
  sumEl.textContent = sum;
  if (sum <= 20) {
    messageEl.textContent = "Hit or Stand?";
  } else if (sum === 21) {
    messageEl.textContent = "Blackjack! You win 2x your bet! 🥳";
    hasBlackjack = true;
    isAlive = false;
    payout(true);
  } else {
    messageEl.textContent = "Bust! You lose. 😭";
    isAlive = false;
    payout(false);
  }
}

function newCard() {
  if (isAlive === true && hasBlackjack === false) {
    let newCard = getRandomCard();
    cards.push(newCard);
    sum += newCard;
    renderGame();
  }
}

function stand() {
  if (isAlive === true) {
    isAlive = false;
    let dealerSum = 0;

    while (dealerSum < 17) {
      dealerSum += getRandomCard();
    }

    if (dealerSum > 21) {
      message = "Dealer busts! You win! 🥳";
      payout(true);
    } else if (dealerSum > sum) {
      // Dealer has a higher score than you
      message = "Dealer wins with " + dealerSum + ". 😭";
      payout(false);
    } else if (dealerSum < sum) {
      // You have a higher score than the dealer
      message = "You win! Dealer had " + dealerSum + ". 🥳";
      payout(true);
    } else {
      // It's a draw (Push)
      message = "It's a tie! 🤝";
      balance += currentBet;
      updateUI();
    }

    messageEl.textContent = message;
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
  if (didWin === true) {
    balance += currentBet * 2;
  } else {
    balance -= currentBet;
  }
  
  // NEW: Prevent negative balance and trigger bankruptcy
  if (balance <= 0) {
    balance = 0;
    currentBet = 0; // Force their bet to 0
  }
  
  updateUI();
}
