// Importe aus dem js-Verzeichnis
import { matheCardValues } from './mathe.js';
import { geschichteCardValues } from './geschichte.js';

const gameboard = document.getElementById("game-board");
const levelSelect = document.getElementById("level");
const schulformSelect = document.getElementById("schulform");
const fachSelect = document.getElementById("fach");
const timeDisplay = document.getElementById("time");
const triesDisplay = document.getElementById("tries");

// Sound elements
//const cardFlipSound = new Audio("./media/click.mp3");
const winSound = new Audio("./media/gewonnen.mp3");

const cardValues = {
  mathe: matheCardValues,
  geschichte: geschichteCardValues,
};

let cards = [];
let flippedCards = [];
let matchedCards = [];
let tries = 0;
let startTime;
let timerInterval;

function shuffleCards(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createGameboard(schulform, level, fach) {
  clearInterval(timerInterval); 
  resetStats(); 
  flippedCards = [];
  matchedCards = [];
  gameboard.innerHTML = ""; 

  let numPairs; // Anzahl der Kartenpaare basierend auf dem Level
  switch (level) {
    case "easy":
      numPairs = 6; // 12 Karten (6 Paare)
      gameboard.style.gridTemplateColumns = "repeat(3, 1fr)";
      break;
    case "normal":
      numPairs = 8; // 16 Karten (8 Paare)
      gameboard.style.gridTemplateColumns = "repeat(4, 1fr)";
      break;
    case "hard":
      numPairs = 10; // 20 Karten (10 Paare)
      gameboard.style.gridTemplateColumns = "repeat(5, 1fr)";
      break;
    default:
      console.error(`Unbekanntes Level: ${level}`);
      return;
  }

  const selectedValues = cardValues[fach]?.[schulform]?.[level];

  // Fehlerbehandlung: Überprüfen, ob genügend Werte vorhanden sind
  if (!selectedValues || selectedValues.length < numPairs) {
    console.error(`Nicht genügend Aufgaben für Fach: ${fach}, Schulform: ${schulform}, Level: ${level}`);
    gameboard.innerHTML = "<p>Keine Aufgaben verfügbar. Bitte wähle eine andere Kombination.</p>";
    return;
  }

  // Karten basierend auf der benötigten Anzahl von Paaren auswählen
  const valuesForGame = selectedValues.slice(0, numPairs); // Nur die ersten numPairs auswählen
  const cardPairs = valuesForGame.flatMap((item) => [
    { value: item.set1, pair: item.set2, id: item.id },
    { value: item.set2, pair: item.set1, id: item.id },
  ]);
  cards = shuffleCards(cardPairs);

  // Karten erstellen und dem Spielfeld hinzufügen
  cards.forEach((cardData) => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <div class="card-back"></div>
      <div class="card-front">${cardData.value}</div>
    `;

    card.dataset.pair = cardData.pair; // Paar-Information hinterlegen

    card.addEventListener("click", () => flipCard(card));
    gameboard.appendChild(card);
  });

  startTimer(); // Timer starten
}

function flipCard(card) {
  if (card.classList.contains("flipped") || flippedCards.length >= 2) {
    return;
   
  }

  card.classList.add("flipped");
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    tries++;
    triesDisplay.textContent = tries;
    checkForMatch();
  }
}

function checkForMatch() {
  const [card1, card2] = flippedCards;

  // Vergleiche die Paar-Werte
  if (
    card1.dataset.pair === card2.querySelector(".card-front").textContent &&
    card2.dataset.pair === card1.querySelector(".card-front").textContent
  ) {
    matchedCards.push(card1, card2);
    flippedCards = [];

    if (matchedCards.length === cards.length) {
      stopTimer();
      showWinPopup();
    }
  } else {
    setTimeout(() => {
      card1.classList.remove("flipped");
      card2.classList.remove("flipped");
      flippedCards = [];
    }, 1000);
  }
}

function showWinPopup() {
  // Play win sound
  winSound.play();
  // Feuerwerk starten
  const duration = 15 * 1000; // Feuerwerk dauert 15 Sekunden
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Partikel für zwei Bereiche starten
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
    );
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    );
  }, 250);
  const popup = document.createElement("div");
  popup.id = "win-popup";
  popup.innerHTML = `
    <div class="popup-content">
      <h2>Du hast gewonnen!</h2>
      <p>Zeit: ${timeDisplay.textContent} Sekunden</p>
      <p>Versuche: ${tries}</p>
      <button id="save-score">Spielstand speichern</button>
      <button id="restart-game">Neues Spiel starten</button>
    </div>
  `;
  popup.style.position = "fixed";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.backgroundColor = "#fff";
  popup.style.padding = "20px";
  popup.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
  popup.style.zIndex = "1000";

  document.body.appendChild(popup);

  document.getElementById("save-score").addEventListener("click", saveGameScore);
  document.getElementById("restart-game").addEventListener("click", () => {
    document.body.removeChild(popup);
    updateGameboard();
  });
}

function saveGameScore() {
  alert("Spielstand wurde gespeichert (Simulation)");
  // Hier kann die tatsächliche Logik für das Speichern implementiert werden
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    timeDisplay.textContent = elapsedTime;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function resetStats() {
  stopTimer();
  timeDisplay.textContent = 0;
  tries = 0;
  triesDisplay.textContent = 0;
}

function updateGameboard() {
  const level = levelSelect.value;
  const schulform = schulformSelect.value;
  const fach = fachSelect.value;
  createGameboard(schulform, level, fach);
}

levelSelect.addEventListener("change", updateGameboard);
schulformSelect.addEventListener("change", updateGameboard);
fachSelect.addEventListener("change", updateGameboard);

createGameboard("grundschule", "easy", "mathe");

let isPaused = false;

document.getElementById("pause").addEventListener("click", () => {
  if (!isPaused) {
    isPaused = true;
    clearInterval(timerInterval); // Timer stoppen
    document.querySelectorAll(".card").forEach((card) => {
      card.style.pointerEvents = "none"; // Karten deaktivieren
    });
    document.getElementById("pause").disabled = true;
    document.getElementById("start").disabled = false;
  }
});

document.getElementById("start").addEventListener("click", () => {
  if (isPaused) {
    isPaused = false;
    startTimer(); // Timer wieder starten
    document.querySelectorAll(".card").forEach((card) => {
      card.style.pointerEvents = ""; // Karten wieder aktivieren
    });
    document.getElementById("pause").disabled = false;
    document.getElementById("start").disabled = true;
  }
});