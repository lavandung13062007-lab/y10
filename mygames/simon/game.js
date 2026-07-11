const BEST_KEY = "y9-simon-best";
const LIGHT_MS = 420;
const GAP_MS = 220;

const pads = [...document.querySelectorAll(".pad")];
const roundEl = document.getElementById("round");
const bestEl = document.getElementById("best");
const centerDot = document.getElementById("centerDot");
const overlayEl = document.getElementById("overlay");
const overlayTitleEl = document.getElementById("overlayTitle");
const overlayMsgEl = document.getElementById("overlayMsg");
const overlayBtn = document.getElementById("overlayBtn");

let best = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
bestEl.textContent = best;

let state = "ready"; // ready | showing | playing | over
let sequence, inputIndex;

function lightPad(i, ms) {
  return new Promise(resolve => {
    pads[i].classList.add("lit");
    setTimeout(() => {
      pads[i].classList.remove("lit");
      setTimeout(resolve, GAP_MS);
    }, ms);
  });
}

async function playSequence() {
  state = "showing";
  centerDot.textContent = "👀";
  await new Promise(r => setTimeout(r, 400));
  for (const i of sequence) {
    await lightPad(i, LIGHT_MS);
  }
  inputIndex = 0;
  state = "playing";
  centerDot.textContent = "?";
}

function addRound() {
  sequence.push(Math.floor(Math.random() * 4));
  roundEl.textContent = String(sequence.length);
}

function onPadClick(i) {
  if (state !== "playing") return;
  pads[i].classList.add("lit");
  setTimeout(() => pads[i].classList.remove("lit"), 180);

  if (sequence[inputIndex] !== i) {
    endGame();
    return;
  }
  inputIndex++;
  if (inputIndex === sequence.length) {
    state = "between";
    setTimeout(() => {
      addRound();
      playSequence();
    }, 550);
  }
}

pads.forEach((el, i) => el.addEventListener("click", () => onPadClick(i)));

function startGame() {
  sequence = [];
  overlayEl.classList.add("hidden");
  addRound();
  playSequence();
}

function endGame() {
  state = "over";
  const roundReached = sequence.length - 1;
  if (roundReached > best) {
    best = roundReached;
    bestEl.textContent = best;
    localStorage.setItem(BEST_KEY, String(best));
  }
  centerDot.textContent = "?";
  overlayTitleEl.textContent = "Sai rồi!";
  overlayMsgEl.textContent = `Bạn nhớ được ${roundReached} vòng · Kỷ lục: ${best}`;
  overlayBtn.textContent = "Chơi lại";
  overlayEl.classList.remove("hidden");
}

overlayBtn.addEventListener("click", startGame);
