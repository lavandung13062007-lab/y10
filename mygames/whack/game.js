const BEST_KEY = "y9-whack-best";
const ROUND_SECONDS = 30;
const HOLE_COUNT = 9;

const board = document.getElementById("board");
const scoreEl = document.getElementById("score");
const timeLeftEl = document.getElementById("timeLeft");
const bestEl = document.getElementById("best");
const overlayEl = document.getElementById("overlay");
const overlayTitleEl = document.getElementById("overlayTitle");
const overlayMsgEl = document.getElementById("overlayMsg");
const overlayBtn = document.getElementById("overlayBtn");

let best = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
bestEl.textContent = best;

let state = "ready"; // ready | playing | over
let score, timeLeft, holeEls, spawnTimer, hideTimer, countdownTimer, activeHole;

function buildBoard() {
  board.innerHTML = Array.from({ length: HOLE_COUNT }, (_, i) =>
    `<div class="hole" data-index="${i}"><div class="mole"></div></div>`
  ).join("");
  holeEls = [...board.querySelectorAll(".hole")];
  holeEls.forEach(el => el.addEventListener("click", () => onHoleClick(el)));
}

function randomDelay(min, max) {
  return min + Math.random() * (max - min);
}

function spawnMole() {
  if (state !== "playing") return;
  if (activeHole) {
    activeHole.classList.remove("up", "hit");
  }
  const candidates = holeEls;
  const hole = candidates[Math.floor(Math.random() * candidates.length)];
  activeHole = hole;
  hole.classList.remove("hit");
  hole.classList.add("up");

  const upMs = randomDelay(600, 950);
  hideTimer = setTimeout(() => {
    if (hole === activeHole) {
      hole.classList.remove("up");
      activeHole = null;
    }
    scheduleNextSpawn();
  }, upMs);
}

function scheduleNextSpawn() {
  clearTimeout(spawnTimer);
  spawnTimer = setTimeout(spawnMole, randomDelay(250, 550));
}

function onHoleClick(hole) {
  if (state !== "playing") return;
  if (!hole.classList.contains("up") || hole.classList.contains("hit")) return;
  hole.classList.add("hit");
  clearTimeout(hideTimer);
  score++;
  scoreEl.textContent = score;
  setTimeout(() => {
    hole.classList.remove("up", "hit");
    if (hole === activeHole) activeHole = null;
    scheduleNextSpawn();
  }, 150);
}

function tickTimer() {
  timeLeft--;
  timeLeftEl.textContent = timeLeft;
  if (timeLeft <= 0) {
    endGame();
  }
}

function startGame() {
  score = 0;
  timeLeft = ROUND_SECONDS;
  scoreEl.textContent = "0";
  timeLeftEl.textContent = String(timeLeft);
  activeHole = null;
  holeEls.forEach(el => el.classList.remove("up", "hit"));
  state = "playing";
  overlayEl.classList.add("hidden");
  countdownTimer = setInterval(tickTimer, 1000);
  scheduleNextSpawn();
}

function endGame() {
  state = "over";
  clearInterval(countdownTimer);
  clearTimeout(spawnTimer);
  clearTimeout(hideTimer);
  holeEls.forEach(el => el.classList.remove("up", "hit"));
  if (score > best) {
    best = score;
    bestEl.textContent = best;
    localStorage.setItem(BEST_KEY, String(best));
  }
  overlayTitleEl.textContent = "Hết giờ!";
  overlayMsgEl.textContent = `Đập được ${score} con · Kỷ lục: ${best}`;
  overlayBtn.textContent = "Chơi lại";
  overlayEl.classList.remove("hidden");
}

overlayBtn.addEventListener("click", startGame);

buildBoard();
