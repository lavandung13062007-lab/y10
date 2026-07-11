const BEST_KEY = "y9-memory-best";

const board = document.getElementById("board");
const movesEl = document.getElementById("moves");
const bestEl = document.getElementById("best");
const restartBtn = document.getElementById("restartBtn");
const overlayEl = document.getElementById("overlay");
const overlayMsgEl = document.getElementById("overlayMsg");
const overlayBtn = document.getElementById("overlayBtn");
const hintEl = document.querySelector(".hint");

const PREVIEW_SECONDS = 3;
const originalHintText = hintEl.textContent;

const SHAPES = [
  { type: "circle", color: "hsl(165,70%,50%)" },
  { type: "square", color: "hsl(255,70%,65%)" },
  { type: "diamond", color: "hsl(30,90%,60%)" },
  { type: "triangle", color: "hsl(340,80%,65%)" },
  { type: "star", color: "hsl(48,90%,60%)" },
  { type: "hex", color: "hsl(210,80%,60%)" },
  { type: "heart", color: "hsl(0,75%,62%)" },
  { type: "ring", color: "hsl(120,60%,50%)" },
];

let best = localStorage.getItem(BEST_KEY);
bestEl.textContent = best ? best : "—";

let cards, flipped, matchedCount, moves, locked;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shapeMarkup(shape) {
  return `<div class="shape shape-${shape.type}" style="--shape-color:${shape.color}; ${shape.type === "triangle" ? `border-bottom-color:${shape.color}` : `background:${shape.color}`}"></div>`;
}

function buildDeck() {
  const deck = [];
  SHAPES.forEach((shape, pairId) => {
    deck.push({ pairId, shape });
    deck.push({ pairId, shape });
  });
  return shuffle(deck);
}

function render() {
  board.innerHTML = cards.map((card, i) => `
    <div class="mcard" data-index="${i}">
      <div class="mcard-inner">
        <div class="mcard-face mcard-back">?</div>
        <div class="mcard-face mcard-front">${shapeMarkup(card.shape)}</div>
      </div>
    </div>
  `).join("");

  board.querySelectorAll(".mcard").forEach(el => {
    el.addEventListener("click", () => onCardClick(parseInt(el.dataset.index, 10)));
  });
}

function updateCardClasses() {
  board.querySelectorAll(".mcard").forEach(el => {
    const i = parseInt(el.dataset.index, 10);
    el.classList.toggle("flipped", flipped.includes(i));
    el.classList.toggle("matched", cards[i].matched);
  });
}

function onCardClick(i) {
  if (locked) return;
  if (cards[i].matched) return;
  if (flipped.includes(i)) return;
  if (flipped.length >= 2) return;

  flipped.push(i);
  updateCardClasses();

  if (flipped.length === 2) {
    moves++;
    movesEl.textContent = moves;
    const [a, b] = flipped;
    if (cards[a].pairId === cards[b].pairId) {
      cards[a].matched = true;
      cards[b].matched = true;
      matchedCount += 2;
      flipped = [];
      updateCardClasses();
      if (matchedCount === cards.length) {
        finishGame();
      }
    } else {
      locked = true;
      setTimeout(() => {
        flipped = [];
        locked = false;
        updateCardClasses();
      }, 700);
    }
  }
}

function finishGame() {
  if (!best || moves < parseInt(best, 10)) {
    best = String(moves);
    bestEl.textContent = best;
    localStorage.setItem(BEST_KEY, best);
  }
  overlayMsgEl.textContent = `🎉 Xong rồi! ${moves} lượt lật`;
  overlayEl.classList.remove("hidden");
}

function startPreview() {
  locked = true;
  board.querySelectorAll(".mcard").forEach(el => el.classList.add("preview-open"));

  let remaining = PREVIEW_SECONDS;
  hintEl.textContent = `Ghi nhớ vị trí... bắt đầu sau ${remaining}s`;
  const countdown = setInterval(() => {
    remaining--;
    if (remaining > 0) {
      hintEl.textContent = `Ghi nhớ vị trí... bắt đầu sau ${remaining}s`;
    } else {
      clearInterval(countdown);
    }
  }, 1000);

  setTimeout(() => {
    board.querySelectorAll(".mcard").forEach(el => el.classList.remove("preview-open"));
    hintEl.textContent = originalHintText;
    locked = false;
  }, PREVIEW_SECONDS * 1000);
}

function newGame() {
  cards = buildDeck();
  flipped = [];
  matchedCount = 0;
  moves = 0;
  locked = true;
  movesEl.textContent = "0";
  overlayEl.classList.add("hidden");
  render();
  startPreview();
}

restartBtn.addEventListener("click", newGame);
overlayBtn.addEventListener("click", newGame);

newGame();
