const BEST_KEY = "y9-minesweeper-best";
const ROWS = 9, COLS = 9, MINES = 10;

const board = document.getElementById("board");
const minesLeftEl = document.getElementById("minesLeft");
const timerEl = document.getElementById("timer");
const bestEl = document.getElementById("best");
const flagModeBtn = document.getElementById("flagModeBtn");
const restartBtn = document.getElementById("restartBtn");
const overlayEl = document.getElementById("overlay");
const overlayMsgEl = document.getElementById("overlayMsg");
const overlayBtn = document.getElementById("overlayBtn");

let best = localStorage.getItem(BEST_KEY);
bestEl.textContent = best ? best + "s" : "—";

let cells, revealedCount, flagsPlaced, firstClickDone, state, timerInterval, elapsed, flagMode = false;

function idx(r, c) { return r * COLS + c; }
function inBounds(r, c) { return r >= 0 && r < ROWS && c >= 0 && c < COLS; }

function neighbors(r, c) {
  const list = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc)) list.push([nr, nc]);
    }
  }
  return list;
}

function buildEmptyBoard() {
  cells = Array.from({ length: ROWS * COLS }, () => ({ mine: false, revealed: false, flagged: false, adjacent: 0 }));
}

function placeMines(excludeR, excludeC) {
  const excluded = new Set(neighbors(excludeR, excludeC).map(([r, c]) => idx(r, c)));
  excluded.add(idx(excludeR, excludeC));
  let placed = 0;
  while (placed < MINES) {
    const i = Math.floor(Math.random() * ROWS * COLS);
    if (excluded.has(i) || cells[i].mine) continue;
    cells[i].mine = true;
    placed++;
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (cells[idx(r, c)].mine) continue;
      let count = 0;
      for (const [nr, nc] of neighbors(r, c)) if (cells[idx(nr, nc)].mine) count++;
      cells[idx(r, c)].adjacent = count;
    }
  }
}

function floodReveal(startR, startC) {
  const stack = [[startR, startC]];
  while (stack.length) {
    const [r, c] = stack.pop();
    const cell = cells[idx(r, c)];
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    revealedCount++;
    if (cell.adjacent === 0) {
      for (const [nr, nc] of neighbors(r, c)) {
        const ncell = cells[idx(nr, nc)];
        if (!ncell.revealed && !ncell.flagged) stack.push([nr, nc]);
      }
    }
  }
}

function startTimer() {
  elapsed = 0;
  timerEl.textContent = "0";
  timerInterval = setInterval(() => {
    elapsed++;
    timerEl.textContent = String(elapsed);
  }, 1000);
}

function checkWin() {
  if (revealedCount === ROWS * COLS - MINES) endGame(true);
}

function revealCell(r, c) {
  if (state !== "playing" && state !== "ready") return;
  const cell = cells[idx(r, c)];
  if (cell.revealed || cell.flagged) return;

  if (!firstClickDone) {
    placeMines(r, c);
    firstClickDone = true;
    state = "playing";
    startTimer();
  }

  if (cell.mine) {
    cell.revealed = true;
    render();
    endGame(false);
    return;
  }
  floodReveal(r, c);
  render();
  checkWin();
}

function toggleFlag(r, c) {
  if (state !== "playing" && state !== "ready") return;
  const cell = cells[idx(r, c)];
  if (cell.revealed) return;
  cell.flagged = !cell.flagged;
  flagsPlaced += cell.flagged ? 1 : -1;
  minesLeftEl.textContent = String(MINES - flagsPlaced);
  render();
}

function render() {
  let html = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = cells[idx(r, c)];
      let cls = "mcell";
      let content = "";
      if (cell.revealed) {
        cls += " revealed";
        if (cell.mine) { cls += " mine"; content = "💣"; }
        else if (cell.adjacent > 0) { cls += " n" + cell.adjacent; content = cell.adjacent; }
      } else if (cell.flagged) {
        cls += " flagged";
        content = "🚩";
      }
      html += `<div class="${cls}" data-r="${r}" data-c="${c}">${content}</div>`;
    }
  }
  board.innerHTML = html;
  board.querySelectorAll(".mcell").forEach(el => {
    const r = parseInt(el.dataset.r, 10), c = parseInt(el.dataset.c, 10);
    el.addEventListener("click", () => {
      if (flagMode) toggleFlag(r, c); else revealCell(r, c);
    });
    el.addEventListener("contextmenu", (e) => { e.preventDefault(); toggleFlag(r, c); });
  });
}

function endGame(won) {
  state = won ? "win" : "over";
  clearInterval(timerInterval);
  if (won) {
    if (!best || elapsed < parseInt(best, 10)) {
      best = String(elapsed);
      bestEl.textContent = best + "s";
      localStorage.setItem(BEST_KEY, best);
    }
  } else {
    cells.forEach(c => { if (c.mine) c.revealed = true; });
    render();
  }
  overlayMsgEl.textContent = won ? `🎉 Xong rồi! ${elapsed} giây` : "💥 Đạp trúng mìn rồi!";
  overlayBtn.textContent = "Chơi lại";
  overlayEl.classList.remove("hidden");
}

function newGame() {
  buildEmptyBoard();
  revealedCount = 0;
  flagsPlaced = 0;
  firstClickDone = false;
  state = "ready";
  clearInterval(timerInterval);
  elapsed = 0;
  timerEl.textContent = "0";
  minesLeftEl.textContent = String(MINES);
  overlayEl.classList.add("hidden");
  render();
}

flagModeBtn.addEventListener("click", () => {
  flagMode = !flagMode;
  flagModeBtn.classList.toggle("active", flagMode);
});
restartBtn.addEventListener("click", newGame);
overlayBtn.addEventListener("click", newGame);

newGame();
