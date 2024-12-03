const gridCells = document.querySelectorAll(".gridContained div");
const playerScoreDisplay = document.getElementById("playerScore");
const systemScoreDisplay = document.getElementById("systemScore");
const roundsDisplay = document.getElementById("rounds");
const restartGameButton = document.getElementById("restartGame");
const clearScoresButton = document.getElementById("clearScores");
const difficultySelector = document.getElementById("difficulty");
const responseElement = document.getElementById("gameResponse"); // Response element

let currentPlayer = "X"; // Player is always "X"
let gameActive = true;
let gameState = Array(9).fill(""); // Tracks the state of the game
let playerScore = 0;
let systemScore = 0;
let rounds = 0; // Tracks the number of rounds played
let difficulty = "medium"; // Default difficulty
let difficultyChangedDuringGame = false; // Flag to track if difficulty was changed during the game

const winningCombinations = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal from top-left to bottom-right
  [2, 4, 6], // Diagonal from top-right to bottom-left
];


// Event listener for difficulty change
difficultySelector.addEventListener("change", (e) => {
  if (gameActive) {
    // Reset game state but don't count the round
    difficultyChangedDuringGame = true;
    resetBoard();
  }
  difficulty = e.target.value;
});

// Add click event listeners to each cell
gridCells.forEach((cell, index) => {
  cell.addEventListener("click", () => handlePlayerMove(cell, index));
});

function handlePlayerMove(cell, index) {
  if (!gameActive || gameState[index] !== "") return;

  // Player's move
  gameState[index] = currentPlayer;
  cell.textContent = currentPlayer;

  if (checkWinner()) {
    displayResponse(`Player ${currentPlayer} wins! Restart The Game.`);
    updateScore("player");
    return;
  }

  if (!gameState.includes("")) {
    displayResponse("It's a draw! Restart The Game.");
    gameActive = false;
    updateRounds();
    return;
  }

  // Switch to system's turn
  currentPlayer = "O";
  setTimeout(handleSystemMove, 500); // Add a delay for system's move
}

function handleSystemMove() {
  if (!gameActive) return;

  // System's AI decides the best move
  const moveIndex = findBestMove();

  // Update the game state and UI
  gameState[moveIndex] = currentPlayer;
  gridCells[moveIndex].textContent = currentPlayer;

  if (checkWinner()) {
    displayResponse(`System (${currentPlayer}) wins! Restart The Game.`);
    updateScore("system");
    return;
  }

  if (!gameState.includes("")) {
    displayResponse("It's a draw! Restart The Game");
    gameActive = false;
    updateRounds();
    return;
  }

  // Switch back to player's turn
  currentPlayer = "X";
}

function findBestMove() {
  if (difficulty === "easy") {
    return easyModeAI();
  } else if (difficulty === "medium") {
    return mediumModeAI();
  } else {
    return hardModeAI();
  }
}

function easyModeAI() {
  // Purely random moves
  const availableCells = gameState.map((val, idx) => (val === "" ? idx : null)).filter((val) => val !== null);
  return availableCells[Math.floor(Math.random() * availableCells.length)];
}

function mediumModeAI() {
  // 50% random, 50% strategic
  const makeRandomMove = Math.random() < 0.5;
  if (makeRandomMove) return easyModeAI();
  return hardModeAI(); // Fallback to hard mode strategy for the other 50%
}

function hardModeAI() {
  // Strategic AI
  // 1. Check if the system can win
  for (let i = 0; i < winningCombinations.length; i++) {
    const [a, b, c] = winningCombinations[i];
    if (gameState[a] === "O" && gameState[b] === "O" && gameState[c] === "") return c;
    if (gameState[a] === "O" && gameState[b] === "" && gameState[c] === "O") return b;
    if (gameState[a] === "" && gameState[b] === "O" && gameState[c] === "O") return a;
  }

  // 2. Block the player from winning
  for (let i = 0; i < winningCombinations.length; i++) {
    const [a, b, c] = winningCombinations[i];
    if (gameState[a] === "X" && gameState[b] === "X" && gameState[c] === "") return c;
    if (gameState[a] === "X" && gameState[b] === "" && gameState[c] === "X") return b;
    if (gameState[a] === "" && gameState[b] === "X" && gameState[c] === "X") return a;
  }

  // 3. Choose the center if available
  if (gameState[4] === "") return 4;

  // 4. Choose a random corner
  const corners = [0, 2, 6, 8].filter((index) => gameState[index] === "");
  if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];

  // 5. Choose a random side
  const sides = [1, 3, 5, 7].filter((index) => gameState[index] === "");
  if (sides.length > 0) return sides[Math.floor(Math.random() * sides.length)];

  // 6. Fallback: Choose any available cell
  return easyModeAI();
}

function checkWinner() {
  return winningCombinations.some((combination) =>
    combination.every((index) => gameState[index] === currentPlayer)
  );
}

function updateScore(winner) {
  gameActive = false;

  if (winner === "player") {
    playerScore++;
    playerScoreDisplay.textContent = playerScore;
  } else if (winner === "system") {
    systemScore++;
    systemScoreDisplay.textContent = systemScore;
  }

  updateRounds();
}

function updateRounds() {
  // Only increment rounds if difficulty wasn't changed mid-game
  if (!difficultyChangedDuringGame) {
    rounds++;
    roundsDisplay.textContent = rounds;
  }
  // Reset the flag for the next game
  difficultyChangedDuringGame = false;
}

// Restart game for a new round
restartGameButton.addEventListener("click", resetBoard);

// Clear the scoreboard and reset the game
clearScoresButton.addEventListener("click", () => {
  playerScore = 0;
  systemScore = 0;
  rounds = 0; // Reset rounds
  playerScoreDisplay.textContent = playerScore;
  systemScoreDisplay.textContent = systemScore;
  roundsDisplay.textContent = rounds; // Update rounds display
  resetBoard();
});

function displayResponse(message) {
  responseElement.textContent = message; // Update the response area
}

// Reset the game board
function resetBoard() {
  gameState.fill("");
  currentPlayer = "X";
  gameActive = true;
  gridCells.forEach((cell) => (cell.textContent = ""));
  displayResponse(""); // Clear the response area for the next round
}
